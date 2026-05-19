import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { TaskCard } from './TaskCard';

const NO_VERSION_LABEL = 'Sin versión';
const isEmptyVersion = (v) => v == null || v === '';
const versionLabel = (v) => (isEmptyVersion(v) ? NO_VERSION_LABEL : v);

export const PlanView = ({ data, projects, onUpdate, onOpen, applyFilters, backlogOpen, showDetails, allVersions: passedAllVersions }) => {
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
    if (passedAllVersions) return passedAllVersions;
    const list = new Set();
    let hasEmpty = false;
    [...data.backlog, ...data.anomalies, ...data.masters].forEach(item => {
      const v = item.version;
      if (isEmptyVersion(v)) {
        hasEmpty = true;
      } else if (String(v).toLowerCase() !== 'backlog') {
        list.add(v);
      }
    });
    const sorted = Array.from(list).sort();
    return hasEmpty ? ['', ...sorted] : sorted;
  }, [data, passedAllVersions]);

  const getVersionTasks = (v) =>
    allFilteredItems.filter(t => (isEmptyVersion(v) ? isEmptyVersion(t.version) : t.version === v));

  const versions = React.useMemo(() => {
    return allVersions.filter(v => getVersionTasks(v).length > 0);
  }, [allVersions, allFilteredItems]);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { draggableId, destination, source } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    const [projectId, id] = draggableId.split('|');
    
    // 1. Determine target list and parameters
    let newVersion = '';
    let targetList = [];
    let targetGlobalIndex = destination.index;

    if (destination.droppableId === 'backlog') {
      newVersion = 'backlog';
      targetList = [...backlogOnlyItems].sort((a,b) => (a.weight || 100) - (b.weight || 100));
    } else {
      const destDroppableId = destination.droppableId;
      const separatorIdx = destDroppableId.lastIndexOf('|');
      
      if (separatorIdx !== -1) {
        newVersion = destDroppableId.substring(0, separatorIdx);
        const colIndex = parseInt(destDroppableId.substring(separatorIdx + 1)) || 0;
        
        const tasks = getVersionTasks(newVersion).sort((a,b) => (a.weight || 100) - (b.weight || 100));
        const numCols = Math.min(maxColsPerVersion, Math.max(1, Math.ceil(tasks.length / 4)));
        
        targetList = tasks;
        targetGlobalIndex = destination.index * numCols + colIndex;
      } else {
        // Fallback for simple ID
        newVersion = destDroppableId;
        targetList = getVersionTasks(newVersion).sort((a,b) => (a.weight || 100) - (b.weight || 100));
        targetGlobalIndex = destination.index;
      }
    }

    // 2. Adjust target list by removing item if it's already there
    let sourceVersion = '';
    if (source.droppableId === 'backlog') {
      sourceVersion = 'backlog';
    } else {
      const sIdx = source.droppableId.lastIndexOf('|');
      sourceVersion = sIdx !== -1 ? source.droppableId.substring(0, sIdx) : source.droppableId;
    }
    
    const movingInSameGlobalList = (newVersion === sourceVersion);
    
    let listForWeight = [...targetList];
    if (movingInSameGlobalList) {
      const idxInList = listForWeight.findIndex(t => t.id === id && (t.project_id === projectId || t.project === projectId));
      if (idxInList !== -1) {
        listForWeight.splice(idxInList, 1);
      }
    }

    // Clamp index
    targetGlobalIndex = Math.min(targetGlobalIndex, listForWeight.length);

    // 3. Calculate Weight based on User Logic
    let newWeight = 100;
    if (listForWeight.length === 0) {
      newWeight = 100;
    } else if (targetGlobalIndex === 0) {
      const nextW = listForWeight[0].weight || 100;
      newWeight = Math.max(1, nextW - 10);
    } else if (targetGlobalIndex >= listForWeight.length) {
      const prevW = listForWeight[listForWeight.length - 1].weight || 100;
      newWeight = prevW + 10;
    } else {
      const prevW = listForWeight[targetGlobalIndex - 1].weight || 100;
      const nextW = listForWeight[targetGlobalIndex].weight || 100;
      newWeight = Math.ceil((prevW + nextW) / 2);
    }

    const updates = { version: newVersion, weight: newWeight };
    if (source.droppableId === 'backlog' && newVersion !== 'backlog') updates.status = 'planned';
    if (newVersion === 'backlog') {
      updates.status = 'backlog';
      updates.version = 'backlog';
    }
    
    onUpdate(id, updates, projectId);
  };

  const maxColsPerVersion = React.useMemo(() => {
    if (versions.length === 1) return 3;
    return 1;
  }, [versions]);

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
                {versions.map(v => {
                  const tasks = getVersionTasks(v).sort((a,b) => (a.weight || 100) - (b.weight || 100));
                  const numCols = Math.min(maxColsPerVersion, Math.max(1, Math.ceil(tasks.length / 4)));

                  // Split tasks into numCols (round-robin)
                  const colGroups = Array.from({ length: numCols }, (_, i) => tasks.filter((_, idx) => idx % numCols === i));

                  const colKey = isEmptyVersion(v) ? '__no_version__' : v;
                  return (
                    <div key={colKey} className={`plan-column ver-col-compact version-group-unified ${isEmptyVersion(v) ? 'no-version' : ''}`} style={{ width: `calc(${numCols} * 300px + ${numCols - 1} * 1rem + 2.8rem)` }}>
                      <div className="column-header-compact">
                        <h4>{versionLabel(v)}</h4>
                        <span className="count-badge">{tasks.length}</span>
                      </div>
                      <div className="version-multi-columns-content">
                        {colGroups.map((colTasks, i) => (
                          <Droppable droppableId={`${v}|${i}`} key={`${v}|${i}`}>
                            {(provided, snapshot) => (
                              <div className={`sub-column-list-clean ${snapshot.isDraggingOver ? 'dragging-over' : ''}`} {...provided.droppableProps} ref={provided.innerRef}>
                                {colTasks.map((item, index) => (
                                  <DraggableCard key={`${item.project_id}|${item.id}`} item={item} index={index} onOpen={onOpen} projects={projects} onUpdate={onUpdate} showDetails={showDetails} allVersions={allVersions} />
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        ))}
                      </div>
                    </div>
                  );
                })}
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
