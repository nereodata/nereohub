import { useState, useEffect, useCallback, useMemo } from 'react'
import './index.css'
import { Sidebar, Dashboard } from './components/Layout'
import { ListView } from './components/ListView'
import { PlanView } from './components/PlanView'
import { Modal } from './components/Modal'
import { useExports } from './hooks/useExports'
import { ProjectManager, TaskCreator } from './components/ProjectModals'
import { UnifiedHeader } from './components/UnifiedHeader'

// Persistence keys
const STORAGE_KEY = 'NereoHub_AppState'

function App() {
  
  // Load initial state
  const getInitialState = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed[key] !== undefined) return parsed[key]
      }
    } catch (e) { console.error('Error loading state', e) }
    return defaultValue
  }

  const [currentTab, setTab] = useState(() => getInitialState('currentTab', 'plan'))
  const [data, setData] = useState({ projects: [], anomalies: [], backlog: [], masters: [], stats: {} })
  const [selectedProject, setSelectedProject] = useState(() => getInitialState('selectedProject', ''))
  const [lastUpdated, setLastUpdated] = useState('')
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(() => getInitialState('sidebarOpen', true))
  const [backlogOpen, setBacklogOpen] = useState(() => getInitialState('backlogOpen', true))
  const [showDetails, setShowDetails] = useState(() => getInitialState('showDetails', true))

  // Modals
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [projectMgrOpen, setProjectMgrOpen] = useState(false)
  const [taskCreatorOpen, setTaskCreatorOpen] = useState(false)

  // Combined Filters (Global)
  const [filters, setFilters] = useState(() => getInitialState('filters', { 
    search: '', 
    statuses: ['backlog', 'planned', 'in_progress', 'blocked'], // Excluding 'completed' and 'cancelled' by default
    versions: [],
    corruptOnly: false
  }))

  // Persistence Effect
  useEffect(() => {
    const stateToSave = {
      currentTab,
      selectedProject,
      sidebarOpen,
      backlogOpen,
      showDetails,
      filters
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave))
  }, [currentTab, selectedProject, sidebarOpen, backlogOpen, showDetails, filters])

  // Sync versions filter when data loads ONLY if it hasn't been set before (is empty)
  useEffect(() => {
    if (data.projects.length > 0 && filters.versions.length === 0) {
      // Check if we already have a saved filter state with versions in localStorage
      const saved = localStorage.getItem(STORAGE_KEY)
      const hasSavedVersions = saved && JSON.parse(saved).filters?.versions?.length > 0
      
      if (!hasSavedVersions) {
        const allVers = new Set();
        [...data.backlog, ...data.anomalies, ...data.masters].forEach(t => {
          if (t.version && t.version !== 'backlog') allVers.add(t.version);
        });
        if (allVers.size > 0) {
          setFilters(prev => ({...prev, versions: Array.from(allVers)}));
        }
      }
    }
  }, [data]);

  // Sync selectedTask metadata when data refreshes
  useEffect(() => {
    if (selectedTask) {
      const allItems = [...data.backlog, ...data.anomalies, ...data.masters];
      const found = allItems.find(t => 
        t.id === selectedTask.id && 
        (t.project_id === (selectedTask.project_id || selectedTask.project))
      );
      if (found) {
        setSelectedTask(found);
      }
    }
  }, [data]);

  const { exportCSV, exportExcel, exportPDF } = useExports(data)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/data')
      const newData = await res.json()
      setData(newData)
      setLastUpdated(new Date().toLocaleTimeString())
    } catch (err) { console.error('Fetch error:', err) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchData()
    const timer = setInterval(fetchData, 60000)
    return () => clearInterval(timer)
  }, [fetchData])

  const updateTask = useCallback(async (id, fields, projectId) => {
    setData(prev => {
      const newData = { ...prev }
      const updateList = (list) => list.map(item => (item.id === id && (item.project_id === projectId || item.project === projectId)) ? { ...item, ...fields } : item)
      newData.backlog = updateList(newData.backlog)
      newData.anomalies = updateList(newData.anomalies)
      newData.masters = updateList(newData.masters)
      return newData
    })
    try {
      const res = await fetch('/api/update_task', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...fields, project_id: projectId })
      })
      if (!res.ok) throw new Error('Update failed');
    } catch (err) { fetchData() }
  }, [fetchData])

  const saveRawContent = useCallback(async (id, content, projectId) => {
    await fetch('/api/save-content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ project_id: projectId, id, content }) });
    fetchData()
  }, [fetchData])

  const handleCreateTask = async (t) => { 
    await fetch('/api/task', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(t) }); 
    fetchData() 
  }

  // Unified Filter Logic
  const applyFilters = useCallback((item, ignoreCorruptFilter = false) => {
    const isCorruptMode = !ignoreCorruptFilter && filters.corruptOnly;
    
    // 1. If in "corrupt only" mode, but item is not corrupt, filter it out
    if (isCorruptMode && !item.is_corrupt) return false;
    
    // 2. Project Filter
    if (selectedProject && (item.project_id !== selectedProject && item.project !== selectedProject)) return false;
    
    // 3. Search Filter
    if (filters.search) {
      const searchTerms = filters.search.toLowerCase().split(/\s+/).filter(Boolean);
      const matchesAllTerms = searchTerms.every(term => {
        const sid = String(item.id || '').toLowerCase();
        const stit = (item.title || '').toLowerCase();
        const sdesc = (item.description || '').toLowerCase();
        const sbody = (item.content_body || '').toLowerCase();
        const spkg = (item.package || '').toLowerCase();
        return sid.includes(term) || stit.includes(term) || sdesc.includes(term) || sbody.includes(term) || spkg.includes(term);
      });
      if (!matchesAllTerms) return false;
    }

    // 4. Bypass for corrupt items
    // If we are specifically looking for corrupt items or calculating their presence,
    // we ignore status/version filters since they are secondary to the error state.
    if (item.is_corrupt && (filters.corruptOnly || ignoreCorruptFilter)) return true;

    // 5. Status Filter
    if (filters.statuses && filters.statuses.length > 0) {
      let s = (item.status || 'backlog').toLowerCase();
      if (s === 'open') s = 'backlog';
      if (s === 'done') s = 'completed';
      if (s === 'en_marcha') s = 'in_progress';
      if (!filters.statuses.includes(s)) return false;
    }

    // 6. Version Filter
    if (filters.versions && filters.versions.length > 0) {
       const v = item.version || 'backlog';
       if (v !== 'backlog' && !filters.versions.includes(v)) return false;
    }
    
    return true;
  }, [filters, selectedProject]);

  const corridorCorruptCount = useMemo(() => {
    let source = [];
    if (currentTab === 'plan') {
      source = [...data.backlog, ...data.anomalies, ...data.masters];
    } else if (currentTab === 'anomalies') {
      source = data.anomalies;
    } else {
      source = data.backlog;
    }
    return source.filter(t => t.is_corrupt && applyFilters(t, true)).length;
  }, [data, applyFilters, currentTab]);

  const allVersions = useMemo(() => {
    const v = new Set();
    [...data.backlog, ...data.anomalies, ...data.masters].forEach(t => {
      if (t.version && t.version !== 'backlog') v.add(t.version);
    });
    return Array.from(v).sort();
  }, [data]);

  const listItems = useMemo(() => {
    if (currentTab === 'dashboard') return []
    let source = currentTab === 'anomalies' ? data.anomalies : data.backlog
    return source.filter(t => applyFilters(t)).sort((a,b) => (a.weight || 100) - (b.weight || 100))
  }, [data, currentTab, applyFilters])

  return (
    <>
      <Sidebar 
        currentTab={currentTab} setTab={setTab} projects={data.projects} 
        onRefresh={fetchData} onManageProjects={() => setProjectMgrOpen(true)} lastUpdated={lastUpdated}
        collapsed={!sidebarOpen} setCollapsed={(v) => setSidebarOpen(!v)}
      />
      <main>
        <UnifiedHeader 
          title={currentTab.toUpperCase()} onNewTask={() => setTaskCreatorOpen(true)}
          filters={filters} setFilters={setFilters} data={data}
          projects={data.projects} selectedProject={selectedProject} setSelectedProject={setSelectedProject}
          exportExcel={exportExcel} exportPDF={exportPDF} exportCSV={exportCSV}
          currentTab={currentTab} backlogOpen={backlogOpen} setBacklogOpen={setBacklogOpen}
          showDetails={showDetails} setShowDetails={setShowDetails}
          corruptCount={corridorCorruptCount}
        />
        
        {loading && data.projects.length === 0 ? (
          <div className="loading-state">
            <div className="spinner"></div> Cargando NereoHub...
          </div>
        ) : (
          <div className="view-content-clean">
            {currentTab === 'dashboard' && <Dashboard stats={data.stats} />}
            {currentTab === 'anomalies' && <ListView items={listItems} onOpen={(t) => { setSelectedTask(t); setModalOpen(true); }} onUpdate={updateTask} projects={data.projects} showDetails={showDetails} allVersions={allVersions} />}
            {currentTab === 'backlog' && <ListView items={listItems} onOpen={(t) => { setSelectedTask(t); setModalOpen(true); }} onUpdate={updateTask} projects={data.projects} showDetails={showDetails} allVersions={allVersions} />}
            {currentTab === 'plan' && (
              <PlanView 
                data={data} projects={data.projects} onUpdate={updateTask} 
                onOpen={(t) => { setSelectedTask(t); setModalOpen(true); }}
                applyFilters={applyFilters} showDetails={showDetails}
                backlogOpen={backlogOpen}
                allVersions={allVersions}
              />
            )}
          </div>
        )}
      </main>

      <Modal isOpen={modalOpen} item={selectedTask} onClose={() => setModalOpen(false)} onRefreshData={fetchData} />
      <ProjectManager 
        projects={data.projects} 
        isOpen={projectMgrOpen} 
        onClose={() => setProjectMgrOpen(false)} 
        onAdd={async (p) => { await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) }); fetchData() }} 
        onDelete={async (r) => { if(confirm("¿Eliminar?")) { await fetch(`/api/projects?root=${encodeURIComponent(r)}`, { method: 'DELETE' }); fetchData() } }} 
        onUpdate={async (oldRoot, p) => { await fetch('/api/projects', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ old_root: oldRoot, ...p }) }); fetchData() }}
      />
      <TaskCreator projects={data.projects} isOpen={taskCreatorOpen} onClose={() => setTaskCreatorOpen(false)} onCreate={handleCreateTask} />
    </>
  )
}

export default App
