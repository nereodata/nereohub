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
    <div className="modal-overlay" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ background: 'white', width: '100%', maxWidth: '900px', height: '90vh', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        <header style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>{item?.id}</h2>
             <div style={{ display: 'flex', gap: '0.5rem' }}>
               <button className="btn-icon-mini" onClick={() => setIsEditing(!isEditing)} title={isEditing ? "Ver" : "Editar"}>{isEditing ? <Eye size={16}/> : <Edit3 size={16}/>}</button>
               {isEditing && <button className="btn-icon-mini" onClick={handleSave} disabled={loading} style={{ color: '#10b981' }}><Save size={16}/></button>}
             </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24}/></button>
        </header>
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          {isEditing ? (
            <textarea value={content} onChange={e => setContent(e.target.value)} style={{ width: '100%', height: '100%', border: 'none', resize: 'none', fontFamily: 'monospace', fontSize: '1rem', outline: 'none' }} />
          ) : (
            <article className="prose max-w-none" dangerouslySetInnerHTML={{ __html: marked.parse(content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '')) }} />
          )}
        </div>
      </div>
    </div>
  );
};
