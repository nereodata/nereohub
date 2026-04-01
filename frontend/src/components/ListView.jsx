import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { TaskCard } from './TaskCard';

export const ListView = ({ items, projects, onUpdate, onOpen, showDetails, allVersions = [] }) => {
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.index === destination.index) return;

    const [projectId, id] = draggableId.split('|');
    const sortedItems = [...items]; // Items are already sorted by weight from props
    
    // Calculate new weight based on neighbors in the current view
    let targetIndex = destination.index;
    let listForWeight = [...sortedItems];
    
    // Remove the item from its current position in the sequence
    const currentIndex = listForWeight.findIndex(t => t.id === id && (t.project_id === projectId || t.project === projectId));
    if (currentIndex !== -1) {
      listForWeight.splice(currentIndex, 1);
    }
    
    // Clamp target index
    targetIndex = Math.min(targetIndex, listForWeight.length);
    
    let newWeight = 100;
    if (listForWeight.length === 0) {
      newWeight = 100;
    } else if (targetIndex === 0) {
      const nextW = listForWeight[0].weight || 100;
      newWeight = Math.max(1, nextW - 10);
    } else if (targetIndex >= listForWeight.length) {
      const prevW = listForWeight[listForWeight.length - 1].weight || 100;
      newWeight = prevW + 10;
    } else {
      const prevW = listForWeight[targetIndex - 1].weight || 100;
      const nextW = listForWeight[targetIndex].weight || 100;
      newWeight = Math.ceil((prevW + nextW) / 2);
    }

    onUpdate(id, { weight: newWeight }, projectId);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="list-view-grid" direction="horizontal">
        {(provided) => (
          <div 
            className="list-view-grid-container"
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={{ 
              padding: '1.5rem 2.5rem', 
              overflowY: 'auto', 
              flex: 1,
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
              gap: '1.5rem' 
            }}
          >
            {items.map((item, index) => (
              <Draggable key={`${item.project_id}|${item.id}`} draggableId={`${item.project_id}|${item.id}`} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`draggable-card-wrapper ${snapshot.isDragging ? 'dragging' : ''}`}
                    style={{ ...provided.draggableProps.style }}
                  >
                    <TaskCard 
                      item={item} onOpen={onOpen} onUpdate={onUpdate}
                      projectColor={projects.find(p => p.name === (item.project_id || item.project))?.color}
                      showDetails={showDetails}
                      allVersions={allVersions}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            {items.length === 0 && <div style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', color: '#64748b' }}>No hay tareas que coincidan con los filtros.</div>}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
