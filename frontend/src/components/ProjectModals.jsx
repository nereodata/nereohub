import React, { useState } from 'react';
import { X, Plus, Trash2, Check } from 'lucide-react';

const COLORS = ['#16374E', '#1d4ed8', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const ProjectManager = ({ projects, isOpen, onClose, onAdd, onDelete }) => {
  const [newProject, setNewProject] = useState({ name: '', root: '', color: COLORS[0] });
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content project-manager-modal" onClick={e => e.stopPropagation()}>
        <header className="modal-header">
          <h3>Gestión de Proyectos</h3>
          <button className="close-btn" onClick={onClose} aria-label="Cerrar"><X size={20}/></button>
        </header>

        <div className="project-list">
          {projects.map(p => (
            <div key={p.root} className="project-item">
              <div className="project-info">
                <div className="project-color-dot" style={{ background: p.color || COLORS[0] }}></div>
                <div className="project-metadata">
                  <div className="project-name">{p.name}</div>
                  <div className="project-root">{p.root}</div>
                </div>
              </div>
              <button className="delete-btn" onClick={() => onDelete(p.root)} title="Eliminar proyecto">
                <Trash2 size={16}/>
              </button>
            </div>
          ))}

          {!isAdding ? (
            <button className="btn-add-project-trigger" onClick={() => setIsAdding(true)}>
              <Plus size={20}/> <span>Nuevo Proyecto</span>
            </button>
          ) : (
            <div className="add-project-form">
              <div className="form-group">
                <input 
                  type="text" 
                  placeholder="Nombre del proyecto" 
                  value={newProject.name} 
                  onChange={e => setNewProject({...newProject, name: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <input 
                  type="text" 
                  placeholder="Ruta Raíz (Ej: C:\Work\NereoHub)" 
                  value={newProject.root} 
                  onChange={e => setNewProject({...newProject, root: e.target.value})} 
                />
              </div>
              <div className="color-palette">
                {COLORS.map(c => (
                  <div 
                    key={c} 
                    className={`color-chip ${newProject.color === c ? 'selected' : ''}`}
                    onClick={() => setNewProject({...newProject, color: c})} 
                    style={{ background: c }}
                  >
                    {newProject.color === c && <Check size={12} color="white"/>}
                  </div>
                ))}
              </div>
              <div className="form-actions">
                <button className="btn-primary" onClick={() => { onAdd(newProject); setIsAdding(false); }}>Añadir</button>
                <button className="btn-secondary" onClick={() => setIsAdding(false)}>Cancelar</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const TaskCreator = ({ projects, isOpen, onClose, onCreate }) => {
  const [task, setTask] = useState({ title: '', project: projects[0]?.name || '', type: 'feature', package: 'hmi' });
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content task-creator-modal" onClick={e => e.stopPropagation()}>
        <header className="modal-header">
          <h3>Crear Tarea Master</h3>
          <button className="close-btn" onClick={onClose}><X size={20}/></button>
        </header>
        <div className="task-form">
          <div className="form-group">
            <label>Proyecto</label>
            <select value={task.project} onChange={e => setTask({...task, project: e.target.value})}>
              {projects.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-group">
             <label>Título</label>
             <input type="text" placeholder="¿Qué hay que hacer?" value={task.title} onChange={e => setTask({...task, title: e.target.value})} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Tipo</label>
              <select value={task.type} onChange={e => setTask({...task, type: e.target.value})}>
                <option value="feature">Feature</option>
                <option value="bug">Bug / Anomalía</option>
              </select>
            </div>
            <div className="form-group">
              <label>Paquete</label>
              <select value={task.package} onChange={e => setTask({...task, package: e.target.value})}>
                <option value="hmi">HMI / Frontend</option>
                <option value="orchestrator">Orchestrator / Backend</option>
                <option value="context">Context / Knowledge</option>
              </select>
            </div>
          </div>
          <button className="btn-primary btn-full" onClick={() => { onCreate(task); onClose(); }}>Generar Backlog Item</button>
        </div>
      </div>
    </div>
  );
};
