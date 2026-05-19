import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, Box, Tag, ChevronDown, Check, AlertTriangle } from 'lucide-react';

export const MultiSelect = ({ label, options, selected, onChange, icon: Icon, searchable = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);
  useEffect(() => {
    const clickOutside = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);
  const toggleOption = (value) => {
    const newSelected = selected.includes(value) ? selected.filter(v => v !== value) : [...selected, value];
    onChange(newSelected);
  };
  const filteredOptions = options.filter(o => o.label?.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="filter-select-mini" ref={containerRef}>
      <div className={`filter-select-header ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        {Icon && <Icon size={14} />}<span className="fs-label">{label}:</span>
        <span className="fs-value">{selected.length === 0 ? 'Todos' : (selected.length === options.length ? 'Todos' : `${selected.length} s.`)}</span>
        <ChevronDown size={12} className="fs-chevron" />
      </div>
      {isOpen && (
        <div className="filter-select-dropdown">
          <div className="fs-bulk-actions">
            <button onClick={(e) => { e.stopPropagation(); onChange(options.map(o => o.value)); }}>Todos</button>
            <button onClick={(e) => { e.stopPropagation(); onChange([]); }}>Ninguno</button>
          </div>
          {searchable && (
            <div className="fs-search-container"><Search size={12} /><input type="text" placeholder="Buscar..." value={query} onChange={e => setQuery(e.target.value)} autoFocus /></div>
          )}
          <div className="fs-options-container">
            {filteredOptions.map(opt => (
              <div key={opt.value} className={`fs-option ${selected.includes(opt.value) ? 'selected' : ''}`} onClick={() => toggleOption(opt.value)}>
                <div className="fs-checkbox">{selected.includes(opt.value) && <Check size={10} />}</div>
                <span>{opt.label || opt.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const SingleSelect = ({ label, options, selected, onChange, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  useEffect(() => {
    const clickOutside = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);
  const selectedLabel = options.find(o => o.value === selected)?.label || 'Todos los Proyectos';
  return (
    <div className="filter-select-mini" ref={containerRef}>
      <div className={`filter-select-header ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        {Icon && <Icon size={14} />}
        <span className="fs-value">{selectedLabel}</span>
        <ChevronDown size={12} className="fs-chevron" />
      </div>
      {isOpen && (
        <div className="filter-select-dropdown">
          <div className="fs-options-container">
            {options.map(opt => (
              <div key={opt.value} className={`fs-option ${selected === opt.value ? 'selected' : ''}`} onClick={() => { onChange(opt.value); setIsOpen(false); }}>
                <span>{opt.label || opt.value}</span>
                {selected === opt.value && <div className="fs-checkbox-mini"><Check size={10} /></div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const FilterBar = ({ filters, setFilters, projects, selectedProject, setSelectedProject, data, corruptCount }) => {
  const statusOptions = [{ value: 'backlog', label: 'Backlog' }, { value: 'planned', label: 'Planificado' }, { value: 'in_progress', label: 'En Curso' }, { value: 'blocked', label: 'Bloqueado' }, { value: 'completed', label: 'Completado' }, { value: 'cancelled', label: 'Cancelado' }];
  
  useEffect(() => {
    if (corruptCount === 0 && filters.corruptOnly) {
      setFilters(prev => ({ ...prev, corruptOnly: false }));
    }
  }, [corruptCount, filters.corruptOnly, setFilters]);

  const versionOptions = React.useMemo(() => {
    const versions = new Set();
    let hasEmpty = false;
    [...data.backlog, ...data.anomalies, ...data.masters].forEach(t => {
      if (t.version == null || t.version === '') {
        hasEmpty = true;
      } else if (t.version !== 'backlog') {
        versions.add(t.version);
      }
    });
    const opts = Array.from(versions).map(v => ({ value: v, label: v })).sort((a,b) => a.label.localeCompare(b.label));
    return hasEmpty ? [...opts, { value: '', label: 'Sin versión' }] : opts;
  }, [data]);
  const projectOptions = [{ value: '', label: 'Todos los Proyectos' }, ...projects.map(p => ({ value: p.name, label: p.name }))];
  return (
    <div className="filter-row-compact">
      <SingleSelect label="Proyecto" icon={Box} options={projectOptions} selected={selectedProject} onChange={setSelectedProject} />
      <MultiSelect label="Estado" icon={Filter} options={statusOptions} selected={filters.statuses || []} onChange={(s) => setFilters({...filters, statuses: s})} />
      <MultiSelect label="Versión" icon={Tag} options={versionOptions} selected={filters.versions || []} onChange={(v) => setFilters({...filters, versions: v})} searchable={true} />
      
      {corruptCount > 0 && (
        <button 
          className={`filter-btn-check ${filters.corruptOnly ? 'active' : ''}`}
          onClick={() => setFilters({...filters, corruptOnly: !filters.corruptOnly})}
          title={`Mostrar ${corruptCount} tareas con errores de metadatos`}
        >
          <AlertTriangle size={16} /> 
          <span className="corrupt-badge">{corruptCount}</span>
        </button>
      )}
    </div>
  );
};
