import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Copy, ChevronDown, Tag, Hash } from 'lucide-react';

const FloatingSelect = ({ anchorRect, options, onSelect, onClose }) => {
  if (!anchorRect) return null;
  
  const style = {
    position: 'fixed',
    top: `${anchorRect.bottom + 5}px`,
    left: `${anchorRect.right - 140}px`,
    minWidth: '140px',
    zIndex: 9999
  };

  if (anchorRect.bottom + 200 > window.innerHeight) {
    style.top = 'auto';
    style.bottom = `${window.innerHeight - anchorRect.top + 5}px`;
  }

  return createPortal(
    <>
      <div className="portal-overlay-clear" onClick={onClose} />
      <div className="mini-select-portal floating" style={style}>
        {options.map(opt => (
          <div key={opt} className="mini-select-item" onClick={(e) => { e.stopPropagation(); onSelect(e, opt); }}>
            {opt}
          </div>
        ))}
      </div>
    </>,
    document.body
  );
};

export const TaskCard = ({ item, onOpen, onUpdate, projectColor, showDetails = true, allVersions = [] }) => {
  const [editingWeight, setEditingWeight] = useState(false);
  const [weight, setWeight] = useState(item.weight || 100);
  const [activeMenu, setActiveMenu] = useState(null);
  const [anchorRect, setAnchorRect] = useState(null);
  const verRef = useRef(null);
  const statRef = useRef(null);

  useEffect(() => {
    setWeight(item.weight || 100);
  }, [item]);

  const handleCopyId = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.id);
  };

  const saveWeight = (e) => {
    e.stopPropagation();
    setEditingWeight(false);
    const val = parseInt(weight);
    if (!isNaN(val) && val !== item.weight) {
      onUpdate(item.id, { weight: val }, item.project_id || item.project);
    } else {
      setWeight(item.weight || 100);
    }
  };

  const openMenu = (type, ref) => {
    const rect = ref.current.getBoundingClientRect();
    setAnchorRect(rect);
    setActiveMenu(type);
  };

  const closeMenu = () => {
    setActiveMenu(null);
    setAnchorRect(null);
  };

  const typeClass = (item.type || 'feature').toLowerCase();
  const statusDisplay = (item.status || 'open').toLowerCase();
  const statusClass = (statusDisplay === 'open' || statusDisplay === 'backlog') ? 'backlog' : statusDisplay;
  
  const progress = item.estimated_effort > 0 
    ? Math.min(100, Math.round((item.actual_effort / item.estimated_effort) * 100))
    : (statusDisplay === 'completed' || statusDisplay === 'done' ? 100 : 0);

  const availableStatuses = ['backlog', 'planned', 'in_progress', 'blocked', 'completed'];

  return (
    <div className={`premium-task-card ${typeClass} ${!showDetails ? 'is-compact' : ''}`} onClick={() => onOpen(item)}>
      <div className="card-top-accent" style={{ backgroundColor: projectColor || 'var(--accent-primary)' }}></div>
      <div className="card-row-header">
        <div className="project-tag-clean" style={{ color: projectColor || 'var(--accent-primary)' }}>
          {item.project_id || item.project}
        </div>
        <div className="inline-tools-group">
           <div className={`mini-meta-badge weight ${editingWeight ? 'active' : ''}`} onClick={e => { e.stopPropagation(); setEditingWeight(true); }}>
              <Hash size={10} />
              {editingWeight ? (
                <input 
                  type="number" className="mini-meta-input" 
                  value={weight} onChange={e => { e.stopPropagation(); setWeight(e.target.value); }} 
                  onBlur={saveWeight} onKeyDown={e => e.key === 'Enter' && saveWeight(e)}
                  autoFocus
                />
              ) : <span>{item.weight || 0}</span>}
           </div>
           <div className={`mini-meta-badge version ${activeMenu === 'version' ? 'active' : ''}`} ref={verRef} onClick={e => { e.stopPropagation(); activeMenu ? closeMenu() : openMenu('version', verRef); }}>
              <Tag size={10} />
              <span>{item.version || 'backlog'}</span>
              <ChevronDown size={10} className={`chevron ${activeMenu === 'version' ? 'up' : ''}`} />
           </div>
           {activeMenu === 'version' && (
             <FloatingSelect 
               anchorRect={anchorRect} 
               options={['backlog', ...allVersions]} 
               onSelect={(e, val) => { closeMenu(); onUpdate(item.id, { version: val }, item.project_id || item.project); }}
               onClose={closeMenu}
             />
           )}
        </div>
      </div>
      
      <div className="card-main-body">
        <div className="id-row-clean">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className="task-id-text">{item.id}</span>
            <button className="copy-icon-btn-subtle" onClick={handleCopyId} title="Copiar ID"><Copy size={11} /></button>
          </div>
          <span className={`type-tag-subtle ${typeClass}`}>{item.type || 'feature'}</span>
        </div>
        <h3 className="task-card-title">{item.title}</h3>
      </div>

      {showDetails && (
        <div className="task-card-details">
          <div className="progress-bar-container"><div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }}></div></div></div>
          <div className="progress-stats-row"><span>{progress}% COMPLETADO</span><span>{item.actual_effort || 0}h / {item.estimated_effort || 0}h</span></div>
        </div>
      )}
      
      <div className="task-card-footer">
        <div className={`status-marker ${statusClass} interactive ${activeMenu === 'status' ? 'is-active' : ''}`} ref={statRef} onClick={e => { e.stopPropagation(); activeMenu ? closeMenu() : openMenu('status', statRef); }}>
          <span className="marker-dot"></span><span className="marker-label">{item.status || 'open'}</span><ChevronDown size={10} className="marker-chevron" />
        </div>
        {activeMenu === 'status' && (
          <FloatingSelect anchorRect={anchorRect} options={availableStatuses} onSelect={(e, val) => { closeMenu(); onUpdate(item.id, { status: val }, item.project_id || item.project); }} onClose={closeMenu} />
        )}
        <div className="package-label-mini">{item.package !== 'master' ? item.package : 'MASTER'}</div>
      </div>
    </div>
  );
};
