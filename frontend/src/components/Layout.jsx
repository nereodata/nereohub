import React from 'react';
import { LayoutDashboard, Bug, ListTodo, Layers, RefreshCw, FolderCog, ChevronLeft } from 'lucide-react';

export const Sidebar = ({ currentTab, setTab, onRefresh, onManageProjects, lastUpdated, collapsed, setCollapsed }) => (
  <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
    <button className="btn-collapse" onClick={() => setCollapsed(!collapsed)}><ChevronLeft size={14} /></button>
    <div className="logo-section">
      <div className="logo-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img 
          src="/logo.png" 
          alt="NereoHub" 
          style={{ 
            width: '28px', 
            height: '28px', 
            objectFit: 'contain',
            filter: 'brightness(0) invert(1)' 
          }} 
        />
      </div>
      <span className="logo-text">NereoHub</span>
    </div>

    <ul className="nav-menu admin-menu">
      <li className="nav-item" onClick={onManageProjects} title={collapsed ? "Gestionar Proyectos" : ""}>
        <FolderCog size={18} />{!collapsed && <span>Gestionar Proyectos</span>}
      </li>
    </ul>
    <nav className="nav-menu">
      <li className={`nav-item ${currentTab === 'dashboard' ? 'active' : ''}`} onClick={() => setTab('dashboard')} title={collapsed ? "Dashboard" : ""}>
        <LayoutDashboard size={18} />{!collapsed && <span>Dashboard</span>}
      </li>
      <li className={`nav-item ${currentTab === 'anomalies' ? 'active' : ''}`} onClick={() => setTab('anomalies')} title={collapsed ? "Anomalías" : ""}>
        <Bug size={18} />{!collapsed && <span>Anomalías</span>}
      </li>
      <li className={`nav-item ${currentTab === 'backlog' ? 'active' : ''}`} onClick={() => setTab('backlog')} title={collapsed ? "Tareas" : ""}>
        <ListTodo size={18} />{!collapsed && <span>Tareas</span>}
      </li>
      <li className={`nav-item ${currentTab === 'plan' ? 'active' : ''}`} onClick={() => setTab('plan')} title={collapsed ? "Plan de Ejecución" : ""}>
        <Layers size={18} />{!collapsed && <span>Plan de Ejecución</span>}
      </li>
    </nav>
    <ul className="nav-menu footer-menu">
      <li className="nav-item" onClick={onRefresh} title={collapsed ? `Actualizar (${lastUpdated})` : ""}>
        <RefreshCw size={18} />{!collapsed && <span>Actualizar</span>}
      </li>
      {!collapsed && lastUpdated && (
        <div className="last-updated-hint">
          {lastUpdated}
        </div>
      )}
    </ul>
  </aside>
);

export const Dashboard = ({ stats }) => (
  <div style={{ padding: '2rem' }}>
    <h2 style={{ marginBottom: '2rem' }}>Resumen del Sistema</h2>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
      <StatCard label="Anomalías Abiertas" value={stats.bugs_open} color="#ef4444" />
      <StatCard label="Tareas Pendientes" value={stats.tasks_pending} color="#3b82f6" />
      <StatCard label="Tareas Completadas" value={stats.tasks_done} color="#10b981" />
      <StatCard label="Progreso Global" value={`${stats.tasks_done + stats.tasks_pending > 0 ? Math.round((stats.tasks_done / (stats.tasks_done + stats.tasks_pending)) * 100) : 0}%`} color="#8b5cf6" />
    </div>
  </div>
);

const StatCard = ({ label, value, color }) => (
  <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', borderLeft: `4px solid ${color}` }}>
    <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>{label}</div>
    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#334155' }}>{value}</div>
  </div>
);
