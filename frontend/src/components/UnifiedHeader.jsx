import React from 'react';
import { Search, Plus, Download, LayoutList, LayoutGrid, Filter } from 'lucide-react';
import { FilterBar } from './FilterBar';

export const UnifiedHeader = ({ 
  title, onNewTask, filters, setFilters, data, projects, selectedProject, setSelectedProject, 
  exportExcel, exportPDF, exportCSV, currentTab, showDetails, setShowDetails,
  backlogOpen, setBacklogOpen, corruptCount
}) => {
  return (
    <header className="unify-header">
      <div className="header-primary-row">
        <div className="view-title"><h1>{currentTab === 'backlog' ? 'TAREAS' : title}</h1></div>
        <div className="search-expandable">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Buscar por ID, título o contenido..." value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} />
        </div>
        <div className="actions-row-compact">
          {currentTab === 'plan' && (
            <button 
              className={`btn-toggle-backlog ${backlogOpen ? 'active' : ''}`} 
              onClick={() => setBacklogOpen(!backlogOpen)}
              title={backlogOpen ? "Ocultar Backlog" : "Mostrar Backlog"}
            >
              <LayoutList size={16} />
              <span>Backlog</span>
            </button>
          )}
          <button className="btn-icon-labeled primary" onClick={onNewTask}><Plus size={16} /><span>Nueva Tarea</span></button>
          <div className="view-toggle-btns">
            <button className={`btn-icon-mini ${showDetails ? 'active' : ''}`} onClick={() => setShowDetails(true)} title="Modo Detallado"><LayoutList size={16} /></button>
            <button className={`btn-icon-mini ${!showDetails ? 'active' : ''}`} onClick={() => setShowDetails(false)} title="Modo Compacto"><LayoutGrid size={16} /></button>
          </div>
        </div>
      </div>
      <div className="header-secondary-row">
        <FilterBar 
          filters={filters} setFilters={setFilters} data={data} 
          projects={projects} selectedProject={selectedProject} setSelectedProject={setSelectedProject} 
          corruptCount={corruptCount}
        />
        <div className="export-actions">
           <button className="btn-export-subtle" onClick={exportPDF}><Download size={14} /> PDF</button>
           <button className="btn-export-subtle" onClick={exportExcel}><Download size={14} /> EXCEL</button>
           <button className="btn-export-subtle" onClick={exportCSV}><Download size={14} /> CSV</button>
        </div>
      </div>
    </header>
  );
};
