import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Copy, ChevronDown, Tag, Hash, Search, Plus, AlertTriangle } from 'lucide-react';

const FloatingSelect = ({ anchorRect, options, onSelect, onClose, allowCustom = false, initialValue = '' }) => {
  const [filter, setFilter] = useState(initialValue);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      // Select the text for easier editing
      inputRef.current.select();
    }
  }, []);

  if (!anchorRect) return null;
  
  const filtered = options.filter(opt => 
    opt.toLowerCase().includes(filter.toLowerCase())
  );

  const style = {
    position: 'fixed',
    top: `${anchorRect.bottom + 5}px`,
    left: `${Math.max(10, anchorRect.right - 240)}px`,
    zIndex: 9999
  };

  if (anchorRect.bottom + 300 > window.innerHeight) {
    style.top = 'auto';
    style.bottom = `${window.innerHeight - anchorRect.top + 5}px`;
  }

  const handleSelect = (e, val) => {
    e.stopPropagation();
    onSelect(e, val);
  };

  return createPortal(
    <>
      <div className="portal-overlay-clear" onClick={onClose} />
      <div className="mini-select-portal floating" style={style}>
        <div className="mini-select-search">
          <Search size={14} />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Filtrar o nuevo..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && filter.trim()) {
                handleSelect(e, filter.trim());
              }
              if (e.key === 'Escape') onClose();
            }}
            onClick={e => e.stopPropagation()}
          />
        </div>
        <div className="mini-select-list">
          {filtered.map(opt => (
            <div key={opt} className="mini-select-item" onClick={(e) => handleSelect(e, opt)}>
              <span>{opt}</span>
            </div>
          ))}
          {allowCustom && filter.trim() && !options.some(o => o.toLowerCase() === filter.toLowerCase().trim()) && (
            <div className="mini-select-item new-value" onClick={(e) => handleSelect(e, filter.trim())}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={12} />
                <span>Usar "{filter.trim()}"</span>
              </div>
            </div>
          )}
          {filtered.length === 0 && !filter.trim() && (
             <div className="mini-select-empty">Sin opciones</div>
          )}
          {filtered.length === 0 && filter.trim() && !allowCustom && (
             <div className="mini-select-empty">No se encontraron coincidencias</div>
          )}
        </div>
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
  const [showCorruption, setShowCorruption] = useState(false);
  const corruptionAnchorRef = useRef(null);
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
    <div className={`premium-task-card ${typeClass} ${!showDetails ? 'is-compact' : ''} ${item.is_corrupt ? 'is-corrupt' : ''}`} onClick={() => onOpen(item)}>
      <div className="card-top-accent" style={{ backgroundColor: projectColor || 'var(--accent-primary)' }}></div>
      <div className="card-row-header">
        <div className="project-tag-clean" style={{ color: item.is_corrupt ? '#ef4444' : (projectColor || 'var(--accent-primary)') }}>
          {item.project_id || item.project}
        </div>
        <div className="inline-tools-group">
            {item.is_corrupt && (
              <>
              <div 
                ref={corruptionAnchorRef}
                className="corrupt-icon-wrap" 
                onClick={e => { e.stopPropagation(); }}
                onMouseEnter={() => setShowCorruption(true)}
                onMouseLeave={() => setShowCorruption(false)}
              >
                <AlertTriangle size={14} />
              </div>
              {showCorruption && corruptionAnchorRef.current && createPortal(
                <div 
                  className="corrupt-tooltip-portal"
                  style={{
                    position: 'fixed',
                    top: corruptionAnchorRef.current.getBoundingClientRect().bottom + 10,
                    // Lógica inteligente: Si estamos muy a la izquierda, crecemos a la derecha
                    left: corruptionAnchorRef.current.getBoundingClientRect().left < 300 
                      ? corruptionAnchorRef.current.getBoundingClientRect().left 
                      : corruptionAnchorRef.current.getBoundingClientRect().left + (corruptionAnchorRef.current.getBoundingClientRect().width / 2),
                    transform: corruptionAnchorRef.current.getBoundingClientRect().left < 300 
                      ? 'none' 
                      : 'translateX(-50%)',
                    zIndex: 2147483647, // Máximo valor posible para estar encima de TODO
                    opacity: 1,
                    visibility: 'visible',
                    pointerEvents: 'none'
                  }}
                >
                  <div style={{ fontWeight: 800, marginBottom: '0.4rem', color: '#fca5a5', fontSize: '0.65rem', borderBottom: '1px solid rgba(252,165,165,0.2)', paddingBottom: '4px' }}>DATOS INCOHERENTES</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {item.corruption_errors?.map((err, i) => (
                      <div key={i} style={{ fontSize: '0.75rem', color: 'white' }}>• {err}</div>
                    ))}
                  </div>
                  <div className="corrupt-tooltip-arrow-portal" style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: corruptionAnchorRef.current.getBoundingClientRect().left < 300 ? '15px' : '50%',
                    transform: corruptionAnchorRef.current.getBoundingClientRect().left < 300 ? 'none' : 'translateX(-50%)',
                    borderWidth: '6px',
                    borderStyle: 'solid',
                    borderColor: 'transparent transparent #1e293b transparent'
                  }} />
                </div>,
                document.body
              )}
              </>
            )}
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
                allowCustom={true}
                initialValue={item.version || 'backlog'}
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
        <h3 className="task-card-title" title={item.title}>{item.title}</h3>
      </div>

      {showDetails && (
        <div className="task-card-details">
          <div className="progress-bar-container"><div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }}></div></div></div>
          <div className="progress-stats-row"><span>{progress}% COMPLETADO</span><span>{item.actual_effort || 0}h / {item.estimated_effort || 0}h</span></div>
        </div>
      )}
      
      <div className="task-card-footer">
        <div className={`status-marker ${statusClass} interactive ${activeMenu === 'status' ? 'is-active' : ''}`} ref={statRef} onClick={e => { e.stopPropagation(); activeMenu ? closeMenu() : openMenu('status', statRef); }}>
          <span className="marker-dot"></span><span className="marker-label">{item.status || 'open'}</span>
        </div>
        {activeMenu === 'status' && (
          <FloatingSelect anchorRect={anchorRect} options={availableStatuses} onSelect={(e, val) => { closeMenu(); onUpdate(item.id, { status: val }, item.project_id || item.project); }} onClose={closeMenu} initialValue={item.status || 'open'} />
        )}
        <div className="package-label-mini">{item.package !== 'master' ? item.package : 'MASTER'}</div>
      </div>
    </div>
  );
};
