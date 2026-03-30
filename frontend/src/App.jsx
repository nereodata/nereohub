import { useState, useEffect, useCallback, useMemo } from 'react'
import './index.css'
import { Sidebar, Dashboard } from './components/Layout'
import { ListView } from './components/ListView'
import { PlanView } from './components/PlanView'
import { Modal } from './components/Modal'
import { useExports } from './hooks/useExports'
import { ProjectManager, TaskCreator } from './components/ProjectModals'
import { UnifiedHeader } from './components/UnifiedHeader'

function App() {
  const [currentTab, setTab] = useState('plan')
  const [data, setData] = useState({ projects: [], anomalies: [], backlog: [], masters: [], stats: {} })
  const [selectedProject, setSelectedProject] = useState('')
  const [lastUpdated, setLastUpdated] = useState('')
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [backlogOpen, setBacklogOpen] = useState(true)
  const [showDetails, setShowDetails] = useState(true)

  // Modals
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [projectMgrOpen, setProjectMgrOpen] = useState(false)
  const [taskCreatorOpen, setTaskCreatorOpen] = useState(false)

  // Combined Filters (Global)
  const [filters, setFilters] = useState({ 
    search: '', 
    statuses: ['backlog', 'planned', 'in_progress', 'blocked'], // Excluding 'completed' by default
    versions: []
  })

  // Sync versions filter when data loads
  useEffect(() => {
    if (data.projects.length > 0 && filters.versions.length === 0) {
      const allVers = new Set();
      [...data.backlog, ...data.anomalies, ...data.masters].forEach(t => {
        if (t.version && t.version !== 'backlog') allVers.add(t.version);
      });
      if (allVers.size > 0) {
        setFilters(prev => ({...prev, versions: Array.from(allVers)}));
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
      await fetch('/api/update_task', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...fields, project_id: projectId })
      })
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
  const applyFilters = useCallback((item) => {
    if (selectedProject && (item.project_id !== selectedProject && item.project !== selectedProject)) return false
    if (filters.search && !item.title?.toLowerCase().includes(filters.search.toLowerCase()) && !item.id.toLowerCase().includes(filters.search.toLowerCase())) return false
    
    // Status Filter
    if (filters.statuses && filters.statuses.length > 0) {
      let s = (item.status || 'backlog').toLowerCase()
      if (s === 'open') s = 'backlog'
      if (s === 'done') s = 'completed'
      if (s === 'en_marcha') s = 'in_progress'
      if (!filters.statuses.includes(s)) return false
    }

    // Version Filter
    if (filters.versions && filters.versions.length > 0) {
       const v = item.version || 'backlog'
       if (v !== 'backlog' && !filters.versions.includes(v)) return false
    }
    
    return true
  }, [filters, selectedProject])

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
    return source.filter(applyFilters).sort((a,b) => (a.weight || 100) - (b.weight || 100))
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
