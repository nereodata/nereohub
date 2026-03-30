import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { TaskCard } from './TaskCard';

export const PlanView = ({ data, projects, onUpdate, onOpen, applyFilters, backlogOpen, showDetails }) => {
  const allFilteredItems = React.useMemo(() => {
    const rawList = [...data.backlog, ...data.anomalies, ...data.masters];
    return rawList.filter(item => {
      if (!applyFilters(item)) return false;
      if (item.parent_id) return false;
      const s = (item.status || 'backlog').toLowerCase();
      if (s === 'backlog' || s === 'open') return false;
      return true;
    });
  }, [data, applyFilters]);

  const backlogOnlyItems = React.useMemo(() => {
    const rawList = [...data.backlog, ...data.anomalies, ...data.masters];
    return rawList.filter(item => {
      if (!applyFilters(item)) return false;
      if (item.parent_id) return false;
      const s = (item.status || 'backlog').toLowerCase();
      return s === 'backlog' || s === 'open';
    });
  }, [data, applyFilters]);

  const allVersions = React.useMemo(() => {
    const list = new Set();
    [...data.backlog, ...data.anomalies, ...data.masters].forEach(item => {
      if (item.version && item.version.toLowerCase() !== 'backlog') list.add(item.version);
    });
    return Array.from(list).sort();
  }, [data]);

  const versions = React.useMemo(() => {
    return allVersions.filter(v => allFilteredItems.some(t => t.version === v));
  }, [allVersions, allFilteredItems]);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { draggableId, destination, source } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    const [projectId, id] = draggableId.split('|');
    const updates = { version: destination.droppableId };
    if (source.droppableId === 'backlog' && destination.droppableId !== 'backlog') updates.status = 'planned';
    if (destination.droppableId === 'backlog') updates.status = 'backlog';
    onUpdate(id, updates, projectId);
  };

  const getVersionTasks = (v) => allFilteredItems.filter(t => t.version === v);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="plan-view-wrapper-clean">
        {backlogOpen && (
          <Droppable droppableId="backlog">
            {(provided, snapshot) => (
              <aside className={`plan-sidebar exterior-glass ${snapshot.isDraggingOver ? 'dragging-over' : ''}`} {...provided.droppableProps} ref={provided.innerRef}>
                <div className="sidebar-header-compact"><h3>Backlog</h3><span className="badge">{backlogOnlyItems.length}</span></div>
                <div className="sidebar-scroll-container">
                  {backlogOnlyItems.sort((a,b) => (a.weight || 100) - (b.weight || 100)).map((item, index) => (
                    <DraggableCard key={`${item.project_id}|${item.id}`} item={item} index={index} onOpen={onOpen} projects={projects} onUpdate={onUpdate} showDetails={showDetails} allVersions={allVersions} />
                  ))}
                  {provided.placeholder}
                </div>
              </aside>
            )}
          </Droppable>
        )}
        <div className="versions-mask-panel">
          <div className="plan-scroll-area">
            <div className="plan-layout-flex">
              <div className="plan-columns-flex-compact">
                {versions.map(v => (
                  <Droppable droppableId={v} key={v}>
                    {(provided, snapshot) => (
                      <div className={`plan-column ver-col-compact ${snapshot.isDraggingOver ? 'dragging-over' : ''}`} {...provided.droppableProps} ref={provided.innerRef}>
                        <div className="column-header-compact"><h4>{v}</h4><span className="count-badge">{getVersionTasks(v).length}</span></div>
                        <div className="column-scroll-container">
                          {getVersionTasks(v).sort((a,b) => (a.weight || 100) - (b.weight || 100)).map((item, index) => (
                            <DraggableCard key={`${item.project_id}|${item.id}`} item={item} index={index} onOpen={onOpen} projects={projects} onUpdate={onUpdate} showDetails={showDetails} allVersions={allVersions} />
                          ))}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
};

const DraggableCard = ({ item, index, onOpen, projects, onUpdate, showDetails, allVersions }) => (
  <Draggable draggableId={`${item.project_id}|${item.id}`} index={index}>
    {(provided, snapshot) => (
      <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`draggable-card-item-compact ${snapshot.isDragging ? 'dragging' : ''}`} style={provided.draggableProps.style}>
        <TaskCard item={item} onOpen={onOpen} onUpdate={onUpdate} projectColor={projects.find(p => p.name === item.project_id)?.color} showDetails={showDetails} allVersions={allVersions} />
      </div>
    )}
  </Draggable>
);
