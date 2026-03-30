import React, { useEffect, useState } from 'react';
import { marked } from 'marked';
import { X, Save, Edit3, Eye } from 'lucide-react';

export const Modal = ({ isOpen, item, onClose, onRefreshData }) => {
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    await fetch('/api/save-content', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: item.project_id || item.project, id: item.id, content })
    });
    setLoading(false); setIsEditing(false); onRefreshData();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-premium" onClick={e => e.stopPropagation()}>
        <header className="modal-header-elegant">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
             <h2>{item?.id}</h2>
             <div style={{ display: 'flex', gap: '0.5rem' }}>
               <button className="btn-icon-mini" onClick={() => setIsEditing(!isEditing)} title={isEditing ? "Vista Previa" : "Editar"}>{isEditing ? <Eye size={16}/> : <Edit3 size={16}/>}</button>
             </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: '0.5rem' }}><X size={22}/></button>
        </header>

        <div className="modal-body-scroll">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: '#94a3b8' }}>Cargando contenido...</div>
          ) : isEditing ? (
            <textarea className="task-edit-textarea" value={content} onChange={e => setContent(e.target.value)} placeholder="Escribe el contenido en Markdown..." autoFocus />
          ) : (
            <article className="task-detail-rendering" dangerouslySetInnerHTML={{ __html: marked.parse(content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '')) }} />
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
