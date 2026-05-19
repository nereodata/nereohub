import React, { useEffect, useMemo, useState } from 'react';
import { marked } from 'marked';
import { X, Save, Edit3, Eye, Tag, Hash, Package, Activity, Clock, Target, ArrowUpRight, GitBranch } from 'lucide-react';
import { wrapTaskIds, extractTaskIdFromText } from '../utils/taskLinks';

export const Modal = ({ isOpen, item, onClose, onRefreshData, onOpenById, knownIds, parentItem, children = [] }) => {
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showChildren, setShowChildren] = useState(false);

  useEffect(() => {
    if (isOpen && item) {
      setLoading(true);
      fetch(`/api/content?path=${encodeURIComponent(item.path)}&project_id=${encodeURIComponent(item.project_id || item.project)}`)
        .then(res => res.json())
        .then(data => { setContent(data.content || ''); setLoading(false); })
        .catch(err => { console.error(err); setLoading(false); });
    }
  }, [isOpen, item]);

  const handleSave = async () => {
    setLoading(true); // Mostramos estado de carga
    
    try {
      const response = await fetch('/api/save-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          project_id: item.project_id || item.project, 
          id: item.id, 
          content 
        })
      });
      
      if (!response.ok) throw new Error('Error al guardar');
      
      // IMPORTANTE: Esperamos a que los datos globales se refresquen por completo
      // para que la tarjeta de fondo se actualice antes de cerrar el editor.
      await onRefreshData();
      
      setIsEditing(false); // Solo cerramos edición tras confirmar refresco
    } catch (err) {
      console.error('Save error:', err);
      alert('No se pudo guardar el contenido. Reintenta por favor.');
    } finally {
      setLoading(false); // Quitamos estado de carga
    }
  };

  const renderedHtml = useMemo(() => {
    if (!content) return '';
    const html = marked.parse(content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, ''));
    return wrapTaskIds(html, knownIds);
  }, [content, knownIds]);

  const handleContentClick = (e) => {
    if (!onOpenById) return;
    const tagged = e.target.closest('[data-task-id]');
    if (tagged) {
      e.preventDefault();
      e.stopPropagation();
      onOpenById(tagged.dataset.taskId);
      return;
    }
    const anchor = e.target.closest('a');
    if (anchor) {
      const id = extractTaskIdFromText(anchor.textContent);
      if (id && (!knownIds || knownIds.has(id))) {
        e.preventDefault();
        e.stopPropagation();
        onOpenById(id);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-premium" onClick={e => e.stopPropagation()}>
        <header className="modal-header-elegant">
          <div className="header-title-container">
             <div style={{ display: 'flex', flexDirection: 'column' }}>
               <span className="header-id-badge">{item?.id}</span>
               <h2 className="header-task-title">{item?.title}</h2>
             </div>
          </div>
          <div className="header-controls-group">
             <button className="btn-icon-header-action" onClick={() => setIsEditing(!isEditing)} title={isEditing ? "Vista Previa" : "Editar"}>
               {isEditing ? <Eye size={18}/> : <Edit3 size={18}/>}
             </button>
             <div className="header-v-separator"></div>
             <button className="btn-close-modal-transparent" onClick={onClose} title="Cerrar ventana">
               <X size={22}/>
             </button>
          </div>
        </header>

        {item && (
          <div className="task-metadata-subheader">
            <div className="metadata-item-premium" title="Proyecto">
              <span className="metadata-label-clean"><Tag size={12}/> PROYECTO</span>
              <span className="metadata-value-clean">{item.project_id || item.project}</span>
            </div>
            <div className="metadata-item-premium" title="Tipo de Tarea">
              <span className="metadata-label-clean"><Activity size={12}/> TIPO</span>
              <span className="metadata-value-clean" style={{ color: `var(--type-${(item.type || 'feature').toLowerCase()})` }}>{item.type || 'feature'}</span>
            </div>
            <div className="metadata-item-premium" title="Estado">
              <span className="metadata-label-clean"><Target size={12}/> ESTADO</span>
              <span className={`metadata-value-clean status-badge ${(item.status || 'open').toLowerCase()}`}>
                {item.status || 'open'}
              </span>
            </div>
            <div className="metadata-item-premium" title="Versión">
              <span className="metadata-label-clean"><Clock size={12}/> VERSIÓN</span>
              <span className="metadata-value-clean">{item.version || 'backlog'}</span>
            </div>
            <div className="metadata-item-premium" title="Peso / Prioridad">
              <span className="metadata-label-clean"><Hash size={12}/> PESO</span>
              <span className="metadata-value-clean">{item.weight || 0}</span>
            </div>
            <div className="metadata-item-premium" title="Paquete / Módulo">
              <span className="metadata-label-clean"><Package size={12}/> PAQUETE</span>
              <span className="metadata-value-clean">{item.package || 'MASTER'}</span>
            </div>
            <div className="metadata-item-premium" title="Esfuerzo (Real / Estimado)">
               <span className="metadata-label-clean"><Activity size={12}/> ESFUERZO</span>
               <span className="metadata-value-clean">{item.actual_effort || 0}h / {item.estimated_effort || 0}h</span>
            </div>
          </div>
        )}

        {item && (parentItem || children.length > 0) && (
          <div className="task-hierarchy-bar">
            {parentItem && (
              <button
                type="button"
                className="task-hierarchy-link"
                onClick={() => onOpenById && onOpenById(parentItem.id)}
                title={`Abrir tarea maestra ${parentItem.id}`}
              >
                <ArrowUpRight size={12} />
                <span className="hierarchy-label">MAESTRA</span>
                <span className="hierarchy-id">{parentItem.id}</span>
              </button>
            )}
            {children.length > 0 && (
              <div className="task-hierarchy-children">
                <button
                  type="button"
                  className="task-hierarchy-toggle"
                  onClick={() => setShowChildren(v => !v)}
                  title="Mostrar/ocultar tareas hijas"
                >
                  <GitBranch size={12} />
                  <span className="hierarchy-label">HIJAS</span>
                  <span className="hierarchy-count">{children.length}</span>
                </button>
                {showChildren && (
                  <div className="task-hierarchy-children-list">
                    {children.map(child => (
                      <button
                        key={child.id}
                        type="button"
                        className="task-hierarchy-link"
                        onClick={() => onOpenById && onOpenById(child.id)}
                        title={`Abrir ${child.id}`}
                      >
                        <span className="hierarchy-id">{child.id}</span>
                        <span className="hierarchy-child-title">{child.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="modal-body-scroll">
          
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: '#94a3b8' }}>Cargando contenido...</div>
          ) : isEditing ? (
            <textarea className="task-edit-textarea" value={content} onChange={e => setContent(e.target.value)} placeholder="Escribe el contenido en Markdown..." autoFocus />
          ) : (
            <article className="task-detail-rendering" onClick={handleContentClick} dangerouslySetInnerHTML={{ __html: renderedHtml }} />
          )}
        </div>

        {isEditing && (
          <footer className="modal-footer-elegant">
            <button className="btn-icon-labeled primary" onClick={handleSave} disabled={loading}>
              <Save size={16}/>
              <span>Guardar Cambios</span>
            </button>
          </footer>
        )}
      </div>
    </div>
  );
};
