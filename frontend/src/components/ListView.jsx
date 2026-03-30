import React from 'react';
import { TaskCard } from './TaskCard';

export const ListView = ({ items, projects, onUpdate, onOpen, showDetails, allVersions = [] }) => {
  return (
    <div style={{ padding: '1.5rem 2.5rem', overflowY: 'auto', flex: 1 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {items.map(item => (
          <TaskCard 
            key={`${item.project_id}|${item.id}`} 
            item={item} onOpen={onOpen} onUpdate={onUpdate}
            projectColor={projects.find(p => p.name === (item.project_id || item.project))?.color}
            showDetails={showDetails}
            allVersions={allVersions}
          />
        ))}
      </div>
      {items.length === 0 && <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>No hay tareas que coincidan con los filtros.</div>}
    </div>
  );
};
