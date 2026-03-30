import React, { useState } from 'react';
import { X, Plus, Trash2, Check, Pencil } from 'lucide-react';

const COLORS = ['#16374E', '#1d4ed8', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const ProjectManager = ({ projects, isOpen, onClose, onAdd, onDelete, onUpdate }) => {
  const [newProject, setNewProject] = useState({ name: '', root: '', color: COLORS[0] });
  const [editingProject, setEditingProject] = useState(null);

  if (!isOpen) return null;

  const handleEdit = (project) => {
    setEditingProject({ ...project, oldRoot: project.root });
  };

  const handleSaveEdit = () => {
    if (onUpdate) {
      onUpdate(editingProject.oldRoot, { 
        name: editingProject.name, 
        root: editingProject.root, 
        color: editingProject.color 
      });
    }
    setEditingProject(null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content project-manager-modal" onClick={e => e.stopPropagation()}>
        <header className="modal-header">
          <h2>Gestión de Proyectos</h2>
          <button className="close-btn" onClick={onClose} aria-label="Cerrar"><X size={24}/></button>
        </header>

        <div className="projects-modal-body">
          {editingProject ? (
            <section className="project-form-section edit-project-section">
              <header className="section-header">
                <h3>Editar proyecto</h3>
              </header>
              <div className="add-project-form editing">
                <div className="form-row main-row">
                  <input 
                    type="text" 
                    placeholder="Nombre" 
                    value={editingProject.name} 
                    onChange={e => setEditingProject({...editingProject, name: e.target.value})} 
                  />
                  <input 
                    type="text" 
                    placeholder="Ruta raíz" 
                    value={editingProject.root} 
                    onChange={e => setEditingProject({...editingProject, root: e.target.value})} 
                  />
                  <div className="color-selection-wrap">
                    <span className="selection-label">Color</span>
                    <div className="color-palette-grid">
                      {COLORS.map(c => (
                        <div 
                          key={c} 
                          className={`color-chip ${editingProject.color === c ? 'selected' : ''}`}
                          onClick={() => setEditingProject({...editingProject, color: c})} 
                          style={{ background: c }}
                        >
                          {editingProject.color === c && <Check size={10} color="white"/>}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="form-actions-row">
                    <button className="btn-save-edit" onClick={handleSaveEdit}>
                      <Check size={18}/> <span>Guardar</span>
                    </button>
                    <button className="btn-cancel-edit" onClick={() => setEditingProject(null)}>
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <section className="project-form-section add-project-section">
              <header className="section-header">
                <h3>Añadir proyecto</h3>
              </header>
              <div className="add-project-form-card">
                <div className="form-main-grid">
                  <div className="form-field-group name-fld">
                    <label>Nombre del proyecto</label>
                    <input 
                      type="text" 
                      placeholder="ej. NereoHub" 
                      value={newProject.name} 
                      onChange={e => setNewProject({...newProject, name: e.target.value})} 
                    />
                  </div>
                  <div className="form-field-group path-fld">
                    <label>Ruta raíz</label>
                    <input 
                      type="text" 
                      placeholder="ej. C:/SW/NereoHub" 
                      value={newProject.root} 
                      onChange={e => setNewProject({...newProject, root: e.target.value})} 
                    />
                  </div>
                  <div className="form-field-group color-fld">
                    <label>Color</label>
                    <div className="color-palette-grid">
                      {COLORS.map(c => (
                        <div 
                          key={c} 
                          className={`color-chip ${newProject.color === c ? 'selected' : ''}`}
                          onClick={() => setNewProject({...newProject, color: c})} 
                          style={{ background: c }}
                        >
                          {newProject.color === c && <Check size={10} color="white"/>}
                        </div>
                      ))}
                    </div>
                  </div>
                  <button className="btn-add-submit" onClick={() => { onAdd(newProject); setNewProject({ name: '', root: '', color: COLORS[0] }); }}>
                    <Plus size={16}/> <span>Añadir</span>
                  </button>
                </div>
                <p className="form-hint">
                  La ruta debe ser la carpeta raíz del proyecto (donde está <code>plan/</code> o <code>packages/</code>).
                </p>
              </div>
            </section>
          )}

          <section className="projects-list-section">
            <header className="section-header">
              <h3>Proyectos configurados</h3>
            </header>
            <div className="projects-list">
              {projects.length === 0 ? (
                <div className="empty-projects-hint">No hay proyectos configurados. Añade uno arriba.</div>
              ) : (
                projects.map(p => (
                  <div key={p.root} className="project-item-row">
                    <div className="project-main-info">
                      <div className="project-color-indicator" style={{ background: p.color || COLORS[0], color: p.color || COLORS[0] }}></div>
                      <div className="project-text-details">
                        <span className="project-display-name">{p.name}</span>
                        <span className="project-display-root">{p.root}</span>
                      </div>
                    </div>
                    <div className="project-row-actions">
                      <button className="btn-row-action edit" onClick={() => handleEdit(p)} title="Editar proyecto">
                        <Pencil size={16}/>
                      </button>
                      <button className="btn-row-action delete" onClick={() => onDelete(p.root)} title="Eliminar proyecto">
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
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
