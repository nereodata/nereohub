
let projectData = { projects: [], anomalies: [], backlog: [], masters: [], stats: {} };
let currentTab = 'dashboard';
let dragSrcEl = null;

function getSelectedProject() {
    const el = document.getElementById('filter-project');
    return el ? el.value : '';
}

function getFilterCriteria() {
    const filterProject = getSelectedProject();
    const statusContainer = document.getElementById('status-filter-container');
    const selectedStatuses = statusContainer ? Array.from(statusContainer.querySelectorAll('input:checked')).map(cb => cb.value) : [];
    const filterType = document.getElementById('filter-plan-type') ? document.getElementById('filter-plan-type').value : 'all';
    const filterVersion = document.getElementById('filter-plan-version') ? document.getElementById('filter-plan-version').value.toLowerCase() : '';
    const filterId = document.getElementById('filter-plan-id') ? document.getElementById('filter-plan-id').value.toLowerCase() : '';
    const filterText = document.getElementById('filter-plan-text') ? document.getElementById('filter-plan-text').value.toLowerCase() : '';

    return {
        project: filterProject,
        statuses: selectedStatuses,
        type: filterType,
        version: filterVersion,
        id: filterId,
        text: filterText
    };
}

function getProjectColor(projectId) {
    if (!projectId) return '';
    const p = (projectData.projects || []).find(pr => pr.name === projectId);
    return (p && p.color) ? p.color : '';
}

function syncProjectFilterFromSidebar() {
    const main = document.getElementById('filter-project');
    if (!main) return;
    const v = main.value;
    const list = document.getElementById('filter-project-list');
    const plan = document.getElementById('filter-project-plan');
    if (list) list.value = v;
    if (plan) plan.value = v;
}

function syncProjectFilterFromPanel(which) {
    const main = document.getElementById('filter-project');
    const list = document.getElementById('filter-project-list');
    const plan = document.getElementById('filter-project-plan');
    const source = which === 'plan' ? plan : list;
    if (!source || !main) return;
    const v = source.value;
    main.value = v;
    if (list) list.value = v;
    if (plan) plan.value = v;
}

// Initial Setup
document.addEventListener('DOMContentLoaded', () => {
    initProjectColorPickers();
    fetchData();
    setInterval(fetchData, 60000);
});

// Paleta Nereodata (dataColors del tema)
const PROJECT_PALETTE = [
    { hex: '#16374E', title: 'Azul Nereodata' },
    { hex: '#55A878', title: 'Verde' },
    { hex: '#EE6C4D', title: 'Coral' },
    { hex: '#E0B354', title: 'Ámbar' },
    { hex: '#A39BB0', title: 'Lavanda' },
    { hex: '#48738C', title: 'Azul apagado' },
    { hex: '#219EBC', title: 'Cian' },
    { hex: '#1D6FA3', title: 'Azul enlace' }
];

function initProjectColorPickers() {
    document.querySelectorAll('.project-color-palette').forEach(container => {
        const targetId = container.getAttribute('data-target');
        const input = document.getElementById(targetId);
        if (!input) return;
        container.innerHTML = PROJECT_PALETTE.map(({ hex, title }) =>
            `<span class="project-palette-chip" data-color="${escapeAttr(hex)}" title="${escapeAttr(title)}" style="background:${escapeAttr(hex)}"></span>`
        ).join('');
        const chips = container.querySelectorAll('.project-palette-chip');
        const defaultColor = PROJECT_PALETTE[0].hex;
        if (!input.value) input.value = defaultColor;
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                const color = chip.getAttribute('data-color');
                if (!color) return;
                input.value = color;
                chips.forEach(c => c.classList.remove('selected'));
                chip.classList.add('selected');
            });
        });
        selectPaletteChip(container, input.value);
    });
}

function selectPaletteChip(paletteEl, color) {
    if (!paletteEl) return;
    const chips = paletteEl.querySelectorAll('.project-palette-chip');
    const match = Array.from(chips).find(c => c.getAttribute('data-color') === color);
    chips.forEach(c => c.classList.remove('selected'));
    if (match) match.classList.add('selected');
    else if (chips.length) chips[0].classList.add('selected');
}

async function fetchData() {
    const btn = document.querySelector('.fa-sync-alt');
    if (btn) btn.parentElement.style.opacity = '0.5';

    try {
        const response = await fetch('/api/data');
        projectData = await response.json();
        updateStats();
        populatePackageFilter();
        populateProjectFilter();

        const noHint = document.getElementById('no-projects-hint');
        const statsGrid = document.querySelector('.stats-grid');
        if (noHint && statsGrid) {
            const hasProjects = (projectData.projects || []).length > 0;
            noHint.style.display = hasProjects ? 'none' : 'block';
            statsGrid.style.display = hasProjects ? 'grid' : 'none';
        }

        if (currentTab === 'dashboard') {
            // Dashboard view logic if any
        } else if (currentTab === 'plan') {
            renderPlan();
        } else {
            renderList();
        }

        const updatedEl = document.getElementById('last-updated');
        if (updatedEl) updatedEl.innerText = `Última actualización: ${new Date().toLocaleTimeString()}`;
    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        if (btn) btn.parentElement.style.opacity = '1';
    }
}

function populateProjectFilter() {
    const selectors = [
        document.getElementById('filter-project'),
        document.getElementById('filter-project-list'),
        document.getElementById('filter-project-plan')
    ].filter(Boolean);
    if (selectors.length === 0) return;
    const currentVal = selectors[0].value;
    const projects = projectData.projects || [];
    const optionsHtml = '<option value="">Todos</option>' + projects.map(p => `<option value="${escapeAttr(p.name)}">${escapeHtml(p.name)}</option>`).join('');
    selectors.forEach(sel => {
        sel.innerHTML = optionsHtml;
        if (currentVal && projects.some(p => p.name === currentVal)) sel.value = currentVal;
    });
}

function updateStats() {
    const bugsOpen = document.getElementById('stat-bugs-open');
    const tasksPending = document.getElementById('stat-tasks-pending');
    const tasksDone = document.getElementById('stat-tasks-done');
    const progress = document.getElementById('stat-progress');

    if (bugsOpen) bugsOpen.innerText = projectData.stats.bugs_open;
    if (tasksPending) tasksPending.innerText = projectData.stats.tasks_pending;
    if (tasksDone) tasksDone.innerText = projectData.stats.tasks_done;

    if (progress) {
        const total = projectData.stats.tasks_done + projectData.stats.tasks_pending;
        const progVal = total > 0 ? Math.round((projectData.stats.tasks_done / total) * 100) : 0;
        progress.innerText = `${progVal}%`;
    }
}

function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    const activeNav = document.querySelector(`[onclick="switchTab('${tab}')"]`);
    if (activeNav) activeNav.classList.add('active');

    const titleEl = document.getElementById('page-title');
    if (titleEl) titleEl.innerText = tab === 'plan' ? 'Plan de Ejecución' : tab.charAt(0).toUpperCase() + tab.slice(1);

    const dashboardView = document.getElementById('dashboard-view');
    const listView = document.getElementById('list-view');
    const planView = document.getElementById('plan-view');

    if (dashboardView) dashboardView.style.display = tab === 'dashboard' ? 'block' : 'none';
    if (listView) listView.style.display = (tab === 'anomalies' || tab === 'backlog') ? 'block' : 'none';
    if (planView) planView.style.display = tab === 'plan' ? 'block' : 'none';

    // Show/Hide Save Order Button
    const saveBtn = document.getElementById('btn-save-order');
    if (saveBtn) {
        saveBtn.style.display = (tab === 'anomalies' || tab === 'backlog') ? 'flex' : 'none';
    }

    if (tab === 'anomalies' || tab === 'backlog') {
        renderList();
    } else if (tab === 'plan') {
        renderPlan();
    }

    // Toggle Export Buttons Visibility
    const exportTasksBtn = document.getElementById('btn-export-tasks');
    const exportBugsBtn = document.getElementById('btn-export-bugs');
    if (exportTasksBtn) exportTasksBtn.style.display = (tab === 'backlog' || tab === 'dashboard') ? 'flex' : 'none';
    if (exportBugsBtn) exportBugsBtn.style.display = (tab === 'anomalies' || tab === 'dashboard') ? 'flex' : 'none';
}

function exportTasks() {
    let data = projectData.backlog || [];
    const proj = getSelectedProject();
    if (proj) data = data.filter(t => (t.project_id || t.project) === proj);
    const columns = [
        { label: 'Proyecto', key: 'project_id' },
        { label: 'ID', key: 'id' },
        { label: 'Título', key: 'title' },
        { label: 'Estado', key: 'status' },
        { label: 'Prioridad', key: 'priority' },
        { label: 'Paquete', key: 'package' },
        { label: 'Fase', key: 'fase' },
        { label: 'Bloque', key: 'bloque' }
    ];
    downloadCSV(data, columns, 'hub_backlog.csv');
}

function exportPlanExcel() {
    const filtered = getFilteredPlan();
    if (filtered.length === 0) {
        alert('No hay datos para exportar');
        return;
    }

    const wsData = filtered.map(item => ({
        'ID': item.id,
        'Título': item.title,
        'Versión': item.version,
        'Naturaleza': item.type,
        'Peso': item.weight,
        'Estado': item.status
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plan de Ejecución");
    XLSX.writeFile(wb, "hub_plan_ejecucion.xlsx");
}

async function exportPlanPDF() {
    const filtered = getFilteredPlan();
    if (filtered.length === 0) {
        alert('No hay datos para exportar');
        return;
    }

    // Show loading indicator
    const btn = document.querySelector('button[onclick="exportPlanPDF()"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';
    btn.disabled = true;

    try {
        const response = await fetch('/api/export-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(filtered)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Error en el servidor');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const today = new Date().toISOString().split('T')[0];
        a.download = `hub_plan_maestro_${today}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

    } catch (e) {
        console.error('[PDF Export Error]', e);
        alert('Error generando PDF: ' + e.message);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

function getFilteredPlan(ignoreStatus = false) {
    const criteria = getFilterCriteria();

    // Map of normalized statuses to match filter values
    const statusMap = {
        'planned': ['planned', 'planificado'],
        'in-progress': ['in-progress', 'in_progress', 'en-curso', 'en-marcha', 'active'],
        'blocked': ['blocked', 'bloqueado', 'bloqueada'],
        'completed': ['completed', 'done', 'closed', 'completada', 'completado', 'fixed'],
        'backlog': ['backlog', 'open', 'backlog']
    };

    const filterItem = (item) => {
        // Items in backlog status belong only to sidebar, never to plan
        const itemStatusRaw = (item.status || 'backlog').toLowerCase().replace('_', '-');
        const isBacklogStatus = ['backlog', 'open'].includes(itemStatusRaw);
        if (isBacklogStatus) return false;

        // Status Check
        const itemStatus = itemStatusRaw;

        let matchesStatus = ignoreStatus;
        if (!ignoreStatus) {
            if (criteria.statuses.length === 0) {
                matchesStatus = false; // If nothing selected, show nothing
            } else {
                matchesStatus = criteria.statuses.some(statusKey => {
                    if (itemStatus === statusKey) return true;
                    if (statusMap[statusKey] && statusMap[statusKey].includes(itemStatus)) return true;
                    return false;
                });
            }
        }

        const matchesType = criteria.type === 'all' || item.type === criteria.type || !item.type;
        const matchesVersion = !criteria.version || (item.version && item.version.toLowerCase().includes(criteria.version));
        const matchesId = !criteria.id || (item.id && item.id.toLowerCase().includes(criteria.id));
        const matchesText = !criteria.text ||
            (item.title && item.title.toLowerCase().includes(criteria.text)) ||
            (item.id && item.id.toLowerCase().includes(criteria.text)) ||
            (item.content_text && item.content_text.toLowerCase().includes(criteria.text));

        const matchesProject = !criteria.project || (item.project_id || item.project) === criteria.project;

        return matchesStatus && matchesType && matchesVersion && matchesId && matchesText && matchesProject;
    };

    const masters = (projectData.masters || []).filter(filterItem);
    const masterIds = new Set((projectData.masters || []).map(m => m.id));
    // In the plan, show only general (master) bugs; hide package bugs that have a general (parent in masters)
    const bugs = projectData.anomalies.filter(b => {
        const hasVersion = b.version && b.version.toLowerCase() !== 'backlog';
        const hasGeneral = b.parent_id && masterIds.has(b.parent_id);
        return hasVersion && !hasGeneral && filterItem(b);
    });

    return [...masters, ...bugs];
}

function exportBugs() {
    let data = projectData.anomalies || [];
    const proj = getSelectedProject();
    if (proj) data = data.filter(t => (t.project_id || t.project) === proj);
    const columns = [
        { label: 'Proyecto', key: 'project_id' },
        { label: 'ID', key: 'id' },
        { label: 'Título', key: 'title' },
        { label: 'Estado', key: 'status' },
        { label: 'Prioridad', key: 'priority' },
        { label: 'Paquete', key: 'package' },
        { label: 'Fase', key: 'fase' },
        { label: 'Bloque', key: 'bloque' }
    ];
    downloadCSV(data, columns, 'hub_bugs.csv');
}

function downloadCSV(data, columns, filename) {
    if (!data || data.length === 0) {
        alert('No hay datos para exportar');
        return;
    }

    const header = columns.map(col => `"${col.label}"`).join(',');
    const rows = data.map(item => {
        return columns.map(col => {
            let val = item[col.key] || '';
            // Clean up value for CSV
            return `"${String(val).replace(/"/g, '""').replace(/\n/g, ' ')}"`;
        }).join(',');
    });

    const csvContent = "\uFEFF" + [header, ...rows].join('\n'); // Added BOM for Excel UTF-8 support
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function populatePackageFilter() {
    const selector = document.getElementById('filter-package');
    if (!selector) return;

    const currentVal = selector.value;
    const packages = new Set([
        ...(projectData.anomalies || []).map(a => a.package),
        ...(projectData.backlog || []).map(b => b.package),
        ...(projectData.masters || []).map(m => m.package)
    ]);

    selector.innerHTML = '<option value="all">Todos los Paquetes</option>';
    packages.forEach(pkg => {
        if (pkg) {
            const opt = document.createElement('option');
            opt.value = pkg;
            opt.innerText = pkg.toUpperCase();
            selector.appendChild(opt);
        }
    });
    selector.value = currentVal;
}

function applyFilters() {
    if (currentTab === 'plan') {
        renderPlan();
    } else {
        renderList();
    }
}

function renderList() {
    const container = document.getElementById('items-container');
    if (!container) return;

    container.innerHTML = '';

    const filterProject = getSelectedProject();
    const filterStatus = document.getElementById('filter-status').value;
    const filterPriority = document.getElementById('filter-priority').value;
    const filterPackage = document.getElementById('filter-package').value;
    const filterTextEl = document.getElementById('filter-search-text');
    const filterText = filterTextEl ? filterTextEl.value.toLowerCase() : '';

    let items = [];
    if (currentTab === 'anomalies') items = projectData.anomalies || [];
    else if (currentTab === 'backlog') {
        const completed = ['completed', 'closed', 'done', 'fixed'];
        const openMasters = (projectData.masters || []).filter(m =>
            !completed.includes((m.status || '').toLowerCase())
        );
        items = [...(projectData.backlog || []), ...openMasters];
    }
    else if (currentTab === 'dashboard') items = projectData.masters || [];

    const filtered = items.filter(item => {
        const matchesProject = !filterProject || (item.project_id || item.project) === filterProject;
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'open' && (item.status === 'open' || item.status === 'backlog' || item.status === 'in_progress')) ||
            (filterStatus === 'closed' && (item.status === 'closed' || item.status === 'done' || item.status === 'completed')) ||
            (filterStatus === item.status);

        const matchesPriority = filterPriority === 'all' || item.priority === filterPriority;
        const matchesPackage = filterPackage === 'all' || item.package === filterPackage;
        const matchesText = !filterText ||
            (item.title && item.title.toLowerCase().includes(filterText)) ||
            (item.id && item.id.toLowerCase().includes(filterText)) ||
            (item.content_text && item.content_text.toLowerCase().includes(filterText));

        return matchesProject && matchesStatus && matchesPriority && matchesPackage && matchesText;
    });

    const projectId = (item) => item.project_id || item.project || '';

    filtered.forEach(item => {
        const card = document.createElement('div');
        const isMaster = item.package === 'master';
        const statusClass = `status-${(item.status || 'open').replace('_', '-')}`;
        const pid = projectId(item);
        card.className = `issue-card ${isMaster ? 'master-card' : ''} ${statusClass}`;
        card.draggable = true;
        card.dataset.id = item.id;
        card.dataset.projectId = pid;
        const projectColor = getProjectColor(pid);

        // Drag Events
        addDragEvents(card);

        const priorityClass = `priority-${item.priority || 'medium'}`;
        // Calculate progress percentage
        let progressPercent = 0;
        if (item.estimated_effort > 0) {
            progressPercent = Math.round(((item.estimated_effort - item.remaining_effort) / item.estimated_effort) * 100);
            if (progressPercent < 0) progressPercent = 0;
            if (progressPercent > 100) progressPercent = 100;
        } else if (item.status === 'completed' || item.status === 'done') {
            progressPercent = 100;
        }

        card.onclick = (e) => {
            openModal(pid, item.path);
        };

        card.innerHTML = `
            ${pid ? `<div class="card-project-header"><span class="card-project-badge"${projectColor ? ` style="background:${escapeAttr(projectColor)}"` : ''}>${escapeHtml(pid)}</span></div>` : ''}
            <div class="meta-info">
                <span class="version-tag">${item.version || 'v0.2'}</span>
                <span class="weight-tag">W: ${item.weight}</span>
                ${item.parent_id ? `<span class="parent-tag">↑ ${item.parent_id}</span>` : ''}
            </div>
            <div class="issue-header">
                <span class="issue-id">${item.id}</span>
                <button class="btn-copy-id" onclick="event.stopPropagation(); copyToClipboard('${item.id}', event)" title="Copiar ID">
                    <i class="fas fa-copy"></i>
                </button>
                <span class="priority-badge ${priorityClass}">${item.priority || (isMaster ? 'Business' : 'Medium')}</span>
            </div>
            <h3 class="issue-title">${item.title}</h3>
            
            <div class="progress-section">
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${progressPercent}%"></div>
                </div>
                <div class="effort-stats">
                    <span>${progressPercent}% Complete</span>
                    <span>Rem: ${item.remaining_effort}h / Est: ${item.estimated_effort}h</span>
                </div>
            </div>

            <div class="issue-footer">
                <div class="status-badge ${statusClass}">
                    <div class="status-dot"></div>
                    ${item.status || 'open'}
                </div>
                <span class="package-tag">${item.package.toUpperCase()}</span>
            </div>
        `;
        container.appendChild(card);
    });
}

// Drag and Drop Logic
function addDragEvents(card) {
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragenter', handleDragEnter);
    card.addEventListener('dragover', handleDragOver);
    card.addEventListener('dragleave', handleDragLeave);
    card.addEventListener('drop', handleDrop);
    card.addEventListener('dragend', handleDragEnd);
}

function handleDragStart(e) {
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.outerHTML);
    this.classList.add('dragging');
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    this.classList.add('over');
}

function handleDragLeave(e) {
    if (e.target === this || !this.contains(e.relatedTarget)) {
        this.classList.remove('over');
    }
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    if (dragSrcEl !== this) {
        // Swap IDs or re-render is complicated due to events bound to elements
        // Easiest is to swap outerHTML then re-bind events
        // But for cleaner DOM manipulation:
        const container = this.parentNode;
        const allCards = [...container.querySelectorAll('.issue-card')];
        const srcIndex = allCards.indexOf(dragSrcEl);
        const targetIndex = allCards.indexOf(this);

        if (srcIndex < targetIndex) {
            container.insertBefore(dragSrcEl, this.nextSibling);
        } else {
            container.insertBefore(dragSrcEl, this);
        }
    }
    return false;
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    const cols = document.querySelectorAll('.issue-card');
    cols.forEach(col => col.classList.remove('over'));
}

async function handlePlanDrop(e) {
    if (e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();

    const targetCard = this.classList.contains('issue-card') ? this : null;
    const targetGrid = this.classList.contains('plan-grid') ? this : this.closest('.plan-grid');

    if (!targetGrid) return false;
    if (dragSrcEl === targetCard) return false;

    const newVersion = targetGrid.dataset.version;
    const cards = [...targetGrid.querySelectorAll('.issue-card')];

    let newWeight;

    if (targetCard) {
        // Dropped ON a card -> Insert before
        const targetIndex = cards.indexOf(targetCard);
        const prevCard = cards[targetIndex - 1];

        const nextW = parseInt(targetCard.dataset.weight);
        const prevW = prevCard ? parseInt(prevCard.dataset.weight) : (nextW - 20);

        // Calculate intermediate weight: Math.ceil((prev + next) / 2)
        newWeight = Math.ceil((prevW + nextW) / 2);

        // If they are identical or consecutive (no gap), and we need the higher value:
        // Math.ceil((50 + 51)/2) = 51. Correct.
        // Math.ceil((50 + 50)/2) = 50. If same, we might want to offset, but rules say higher.
        if (newWeight === prevW && newWeight === nextW) {
            newWeight = nextW;
        }
    } else {
        // Dropped on the grid (empty space) -> append to end
        const lastCard = cards[cards.length - 1];
        newWeight = lastCard ? (parseInt(lastCard.dataset.weight) + 10) : 10;
    }

    // Determine if we should upgrade status to 'planned'
    // This is from dragSrcEl which is usually from projectData (rendered earlier)
    const id = dragSrcEl.dataset.id;
    let itemStatus = dragSrcEl.dataset.status; // Need to ensure status is in dataset

    // If status is not in dataset, we find it in projectData
    if (!itemStatus) {
        const allItems = [...projectData.masters, ...projectData.anomalies, ...projectData.backlog];
        const item = allItems.find(i => i.id === id);
        itemStatus = item ? item.status : 'backlog';
    }

    const projectId = dragSrcEl.dataset.projectId || '';
    const payload = {
        id: id,
        project_id: projectId,
        version: newVersion,
        weight: newWeight
    };

    if (itemStatus === 'backlog' || itemStatus === 'open' || !itemStatus) {
        payload.status = 'planned';
    }

    try {
        const res = await fetch('/api/update_task', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            fetchData(); // Refresh everything
        } else {
            const errData = await res.json().catch(() => ({}));
            const msg = errData.detail || errData.error || 'Error al mover la tarjeta';
            alert(typeof msg === 'string' ? msg : JSON.stringify(msg));
        }
    } catch (err) {
        console.error(err);
        alert('Error de conexión');
    } finally {
        document.querySelectorAll('.over').forEach(el => el.classList.remove('over'));
    }

    return false;
}

async function saveOrder() {
    const container = document.getElementById('items-container');
    const cards = container.querySelectorAll('.issue-card');
    const orderData = {}; // { projectId: { taskId: index } }

    cards.forEach((card, index) => {
        const id = card.dataset.id;
        const pid = card.dataset.projectId || '_';
        if (!orderData[pid]) orderData[pid] = {};
        orderData[pid][id] = index;
    });

    try {
        const res = await fetch('/api/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        if (res.ok) {
            alert('Orden guardado correctamente');
            fetchData();
        } else {
            alert('Error al guardar el orden');
        }
    } catch (e) {
        console.error(e);
        alert('Error de conexión');
    }
}

// Modal Logic (projectId required for multi-project)
async function openModal(projectId, path) {
    const modal = document.getElementById('modal-overlay');
    const body = document.getElementById('modal-body');

    modal.style.display = 'flex';
    body.innerHTML = '<p>Cargando...</p>';
    body.dataset.currentPath = path;
    body.dataset.currentProjectId = projectId || '';

    try {
        const params = new URLSearchParams({ path });
        if (projectId) params.set('project_id', projectId);
        const res = await fetch(`/api/content?${params.toString()}`);
        const data = await res.json();

        if (data.content) {
            const cleanContent = data.content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '');
            body.innerHTML = marked.parse(cleanContent);

            body.querySelectorAll('a').forEach(link => {
                const href = link.getAttribute('href');
                if (href && href.endsWith('.md')) {
                    link.onclick = (e) => {
                        e.preventDefault();
                        const parts = path.split('/');
                        parts.pop();
                        const hrefParts = href.split('/');
                        for (const p of hrefParts) {
                            if (p === '..') parts.pop();
                            else if (p === '.') continue;
                            else parts.push(p);
                        }
                        const newPath = parts.join('/');
                        openModal(projectId, newPath);
                    };
                }
            });
        } else {
            body.innerHTML = '<p>No se pudo cargar el contenido.</p>';
        }
    } catch (e) {
        body.innerHTML = `<p>Error: ${e.message}</p>`;
    }
}

function closeModal(e) {
    if (e.target.id === 'modal-overlay') {
        document.getElementById('modal-overlay').style.display = 'none';
    }
}

function closeModalButton() {
    document.getElementById('modal-overlay').style.display = 'none';
}

// Plan Logic (Masters View)
function renderPlan() {
    const container = document.getElementById('plan-container');
    if (!container) return;

    container.innerHTML = '';

    // Get filtered data (Includes Masters and Bugs with versions)
    const itemsInPlan = getFilteredPlan();

    // Group by Version
    const groups = {};
    itemsInPlan.forEach(task => {
        const ver = task.version || 'Unversioned';
        if (!groups[ver]) groups[ver] = [];
        groups[ver].push(task);
    });

    // Sort Versions (Asc - Oldest to Newest)
    const sortedVersions = Object.keys(groups).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    if (sortedVersions.length === 0) {
        container.innerHTML = '<p style="padding: 2rem; color: var(--text-secondary);">No hay tareas maestras que coincidan con los filtros.</p>';
        return;
    }

    sortedVersions.forEach(version => {
        // Sort items within this version by weight (ASC)
        // If weight is missing or equal, prioritize by 'priority' (critical > high > medium > low)
        const priorityScore = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };

        groups[version].sort((a, b) => {
            const wA = parseInt(a.weight) || 9999;
            const wB = parseInt(b.weight) || 9999;
            if (wA !== wB) return wA - wB;

            const pA = priorityScore[a.priority] ?? 2;
            const pB = priorityScore[b.priority] ?? 2;
            return pA - pB;
        });
        const section = document.createElement('div');
        section.className = 'plan-section';

        const title = document.createElement('h3');
        title.className = 'version-title';
        title.innerText = `${version} (${groups[version].length} Tasks)`;
        section.appendChild(title);

        const grid = document.createElement('div');
        grid.className = 'content-grid plan-grid';
        grid.dataset.version = version;

        // Drop events for the grid (to handle dropping on empty spaces or at the end)
        grid.addEventListener('dragover', handleDragOver);
        grid.addEventListener('dragenter', handleDragEnter);
        grid.addEventListener('dragleave', handleDragLeave);
        grid.addEventListener('drop', handlePlanDrop);

        groups[version].forEach(task => {
            const card = document.createElement('div');
            const typeClass = `type-${task.type || 'funcional'}`;
            const statusClass = `status-${(task.status || 'backlog').replace('_', '-')}`;
            const taskProjectId = task.project_id || task.project || '';
            card.className = `issue-card master-card ${statusClass}`;
            card.draggable = true;
            card.dataset.id = task.id;
            card.dataset.projectId = taskProjectId;
            card.dataset.weight = task.weight;
            card.dataset.version = version;
            card.dataset.status = task.status;
            const planProjectColor = getProjectColor(taskProjectId);

            addDragEvents(card);
            card.removeEventListener('drop', handleDrop);
            card.addEventListener('drop', handlePlanDrop);

            const pathEsc = (task.path || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
            const weightInput = `<input type="number" class="edit-input weight-input" value="${task.weight}" onchange="updateTask('${task.id}', 'weight', this.value, '${taskProjectId.replace(/'/g, "\\'")}')" onclick="event.stopPropagation()">`;
            const versionInput = `<input type="text" class="edit-input version-input" value="${task.version}" onblur="updateTask('${task.id}', 'version', this.value, '${taskProjectId.replace(/'/g, "\\'")}')" onkeydown="if(event.key==='Enter') this.blur();" onclick="event.stopPropagation()">`;

            card.innerHTML = `
                ${taskProjectId ? `<div class="card-project-header"><span class="card-project-badge"${planProjectColor ? ` style="background:${escapeAttr(planProjectColor)}"` : ''}>${escapeHtml(taskProjectId)}</span></div>` : ''}
                <div class="meta-row">
                    <span class="issue-id" onclick="openModal('${taskProjectId.replace(/'/g, "\\'")}', '${pathEsc}')">${task.id}</span>
                    <button class="btn-copy-id" onclick="event.stopPropagation(); copyToClipboard('${task.id}', event)" title="Copiar ID">
                        <i class="fas fa-copy"></i>
                    </button>
                    <span class="type-badge ${typeClass}">${task.type || 'funcional'}</span>
                </div>
                <div class="edit-row">
                    <label>Ver:</label> ${versionInput}
                    <label>W:</label> ${weightInput}
                </div>
                <h4 class="issue-title">${task.title}</h4>
                <div class="issue-footer">
                    <div class="status-badge ${statusClass}">
                        <div class="status-dot"></div>
                        ${task.status}
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

        section.appendChild(grid);
        container.appendChild(section);
    });

    renderBacklogSidebar();
}

function toggleBacklogSidebar() {
    const sidebar = document.getElementById('backlog-sidebar');
    if (sidebar) {
        sidebar.classList.toggle('closed');
    }
}

function renderBacklogSidebar() {
    const container = document.getElementById('backlog-sidebar-content');
    if (!container) return;

    container.innerHTML = '';

    const criteria = getFilterCriteria();
    const anomaliesBase = projectData.anomalies || [];
    const masterIds = new Set((projectData.masters || []).map(m => m.id));

    // Backlog sidebar items: must match project and general filters
    const filterCommon = (item) => {
        const matchesProject = !criteria.project || (item.project_id || item.project) === criteria.project;
        if (!matchesProject) return false;

        const matchesType = criteria.type === 'all' || item.type === criteria.type || !item.type;
        const matchesId = !criteria.id || (item.id && item.id.toLowerCase().includes(criteria.id));

        const sidebarSearchInput = document.getElementById('backlog-sidebar-search');
        const sidebarFilterText = sidebarSearchInput ? sidebarSearchInput.value.toLowerCase() : '';

        let matchesText = true;
        if (sidebarFilterText) {
            matchesText = (item.title && item.title.toLowerCase().includes(sidebarFilterText)) ||
                (item.id && item.id.toLowerCase().includes(sidebarFilterText)) ||
                (item.content_text && item.content_text.toLowerCase().includes(sidebarFilterText));
        } else {
            matchesText = !criteria.text ||
                (item.title && item.title.toLowerCase().includes(criteria.text)) ||
                (item.id && item.id.toLowerCase().includes(criteria.text)) ||
                (item.content_text && item.content_text.toLowerCase().includes(criteria.text));
        }

        return matchesProject && matchesType && matchesId && matchesText;
    };

    const backlogMasters = (projectData.masters || []).filter(t => {
        if (!filterCommon(t)) return false;
        const hasNoVersion = !t.version || t.version.toLowerCase() === 'backlog';
        const status = (t.status || '').toLowerCase();
        const isBacklogLike = status === 'backlog' || status === 'todo' || status === 'open';
        return hasNoVersion || isBacklogLike;
    });

    const backlogBugs = anomaliesBase.filter(b => {
        if (!filterCommon(b)) return false;
        const status = (b.status || '').toLowerCase();
        const isClosed = status === 'completed' || status === 'closed' || status === 'fixed' || status === 'superseded';
        const hasNoVersion = !b.version || b.version.toLowerCase() === 'backlog';
        const isBacklogStatus = status === 'backlog' || status === 'open';
        const inBacklog = !isClosed && (hasNoVersion || isBacklogStatus);
        const hasGeneral = b.parent_id && masterIds.has(b.parent_id);
        return inBacklog && !hasGeneral;
    });

    const backlogItems = [...backlogMasters, ...backlogBugs];

    // Sort by weight (ascending - lower weight = higher priority)
    backlogItems.sort((a, b) => (a.weight ?? 9999) - (b.weight ?? 9999));

    if (backlogItems.length === 0) {
        container.innerHTML = '<p style="padding: 1rem; color: var(--text-secondary); font-size: 0.8rem;">No hay tareas en el backlog.</p>';
        return;
    }

    backlogItems.forEach(item => {
        const card = document.createElement('div');
        const statusClass = `status-${(item.status || 'open').replace('_', '-')}`;
        const priorityClass = `priority-${item.priority || 'medium'}`;
        const w = item.weight ?? 9999;
        const itemProjectId = item.project_id || item.project || '';

        card.className = `issue-card backlog-sidebar-card ${statusClass}`;
        card.draggable = true;
        card.dataset.id = item.id;
        card.dataset.projectId = itemProjectId;
        card.dataset.weight = w;
        card.dataset.version = '';
        card.dataset.status = item.status || 'backlog';
        const sidebarProjectColor = getProjectColor(itemProjectId);

        addDragEvents(card);
        card.removeEventListener('drop', handleDrop);
        card.addEventListener('drop', handleBacklogSidebarDrop);

        const weightInput = `<input type="number" class="edit-input weight-input" value="${w}" onchange="updateTask('${item.id}', 'weight', this.value, '${itemProjectId.replace(/'/g, "\\'")}')" onclick="event.stopPropagation()">`;
        const verVal = (item.version && item.version.toLowerCase() !== 'backlog') ? item.version : '';
        const versionInput = `<input type="text" class="edit-input version-input" placeholder="vX.Y" value="${verVal}" onblur="updateTask('${item.id}', 'version', this.value, '${itemProjectId.replace(/'/g, "\\'")}')" onkeydown="if(event.key==='Enter') this.blur();" onclick="event.stopPropagation()">`;

        card.innerHTML = `
            ${itemProjectId ? `<div class="card-project-header"><span class="card-project-badge"${sidebarProjectColor ? ` style="background:${escapeAttr(sidebarProjectColor)}"` : ''}>${escapeHtml(itemProjectId)}</span></div>` : ''}
            <div class="issue-header">
                <span class="issue-id">${item.id}</span>
                <button class="btn-copy-id" onclick="event.stopPropagation(); copyToClipboard('${item.id}', event)" title="Copiar ID">
                    <i class="fas fa-copy"></i>
                </button>
                <span class="priority-badge ${priorityClass}">${item.priority || 'Medium'}</span>
            </div>
            <div class="edit-row">
                <label>Ver:</label> ${versionInput}
                <label>W:</label> ${weightInput}
                <button class="btn-icon" style="margin-left:auto; color:var(--primary-color);" onclick="planTask('${item.id}', '${itemProjectId.replace(/'/g, "\\'")}', event)" title="Mover al Plan (Planned)"><i class="fas fa-calendar-plus"></i></button>
            </div>
            <h4 class="issue-title">${item.title}</h4>
            <div class="issue-footer">
                <span class="package-tag">${(item.package || 'unknown').toUpperCase()}</span>
            </div>
        `;

        card.onclick = (e) => {
            if (!e.target.closest('.edit-input') && !e.target.closest('.btn-copy-id')) {
                openModal(itemProjectId, item.path);
            }
        };

        container.appendChild(card);
    });

    if (!container.dataset.backlogDropInit) {
        container.dataset.backlogDropInit = '1';
        container.addEventListener('dragover', handleDragOver);
        container.addEventListener('drop', handleBacklogSidebarContainerDrop);
    }
}

function handleBacklogSidebarContainerDrop(e) {
    const sidebar = document.getElementById('backlog-sidebar-content');
    if (!sidebar || !sidebar.contains(dragSrcEl) || !dragSrcEl?.classList?.contains('backlog-sidebar-card')) return;
    const cards = [...sidebar.querySelectorAll('.backlog-sidebar-card')];
    if (cards.length === 0) return;
    const lastCard = cards[cards.length - 1];
    if (lastCard === dragSrcEl) return;
    const lastW = parseInt(lastCard.dataset.weight) || 9999;
    const newWeight = lastW + 10;
    const id = dragSrcEl.dataset.id;
    const projectId = dragSrcEl.dataset.projectId || '';
    e.preventDefault();
    e.stopPropagation();
    fetch('/api/update_task', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, project_id: projectId, weight: newWeight }) })
        .then(r => r.ok ? fetchData() : r.json().then(d => alert(d.detail || d.error || 'Error')))
        .catch(err => { console.error(err); alert('Error de conexión'); });
}

async function handleBacklogSidebarDrop(e) {
    if (e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();

    const sidebar = document.getElementById('backlog-sidebar-content');
    if (!sidebar || !sidebar.contains(dragSrcEl) || !sidebar.contains(this)) {
        return false;
    }

    const targetCard = this;
    if (dragSrcEl === targetCard) return false;

    const allCards = [...sidebar.querySelectorAll('.backlog-sidebar-card')];
    const srcIndex = allCards.indexOf(dragSrcEl);
    const targetIndex = allCards.indexOf(targetCard);

    if (srcIndex < 0 || targetIndex < 0) return false;

    const prevCard = targetIndex > 0 ? allCards[targetIndex - 1] : null;
    const nextCard = targetCard;

    const prevW = prevCard ? parseInt(prevCard.dataset.weight) : 0;
    const nextW = parseInt(nextCard.dataset.weight) || 9999;

    let newWeight = Math.ceil((prevW + nextW) / 2);
    if (newWeight === prevW && newWeight === nextW) newWeight = nextW;

    const id = dragSrcEl.dataset.id;
    const projectId = dragSrcEl.dataset.projectId || '';

    try {
        const res = await fetch('/api/update_task', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, project_id: projectId, weight: newWeight })
        });
        if (res.ok) {
            fetchData();
        } else {
            const errData = await res.json().catch(() => ({}));
            alert(errData.detail || errData.error || 'Error al actualizar peso');
        }
    } catch (err) {
        console.error(err);
        alert('Error de conexión');
    } finally {
        document.querySelectorAll('.over').forEach(el => el.classList.remove('over'));
    }
    return false;
}

async function updateTask(id, field, value, projectId) {
    try {
        const payload = { id };
        if (projectId) payload.project_id = projectId;
        payload[field] = field === 'weight' ? parseInt(value) : value;

        const res = await fetch('/api/update_task', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            // Refresh data to reflect changes (and potentially regroup)
            fetchData();
        } else {
            alert('Error updating task');
        }
    } catch (e) {
        console.error(e);
        alert('Error connecting to server');
    }
}

async function planTask(id, projectId, event) {
    if (event) event.stopPropagation();
    try {
        const payload = { id, status: 'planned' };
        if (projectId) payload.project_id = projectId;

        const res = await fetch('/api/update_task', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            fetchData();
        } else {
            alert('Error al planificar la tarea');
        }
    } catch (e) {
        console.error(e);
        alert('Error de conexión');
    }
}

// --- Project management (UI) ---
function openProjectsModal() {
    cancelEditProject();
    document.getElementById('projects-modal-overlay').style.display = 'flex';
    renderProjectsList();
    document.getElementById('new-project-name').value = '';
    document.getElementById('new-project-root').value = '';
    const newColorEl = document.getElementById('new-project-color');
    const defaultColor = PROJECT_PALETTE[0].hex;
    if (newColorEl) newColorEl.value = defaultColor;
    selectPaletteChip(document.getElementById('new-project-color-palette'), defaultColor);
}

function closeProjectsModal(e) {
    if (e && e.target.id !== 'projects-modal-overlay') return;
    document.getElementById('projects-modal-overlay').style.display = 'none';
}

function renderProjectsList() {
    const list = document.getElementById('projects-list');
    if (!list) return;
    const projects = projectData.projects || [];
    list.innerHTML = projects.map(p => {
        const rootEsc = escapeAttr(p.root);
        const nameEsc = escapeAttr(p.name);
        const colorEsc = escapeAttr(p.color || '');
        const swatchStyle = (p.color && /^#[0-9a-fA-F]{3,8}$/.test(p.color)) ? ` style="background:${escapeAttr(p.color)}"` : '';
        return `<li data-root="${rootEsc}" data-name="${nameEsc}" data-color="${colorEsc}">
            <div class="project-info">
                <span class="project-name-with-color">${swatchStyle ? `<span class="project-color-swatch"${swatchStyle} title="Color de tarjeta"></span>` : ''}<span>${escapeHtml(p.name)}</span></span>
                <div class="project-root">${escapeHtml(p.root)}</div>
            </div>
            <div class="project-actions">
                <button class="btn-icon btn-edit-project" title="Editar"><i class="fas fa-edit"></i></button>
                <button class="btn-icon delete btn-delete-project" title="Eliminar"><i class="fas fa-trash"></i></button>
            </div>
        </li>`;
    }).join('');
    list.querySelectorAll('.btn-edit-project').forEach(btn => {
        btn.onclick = () => {
            const li = btn.closest('li');
            if (li) editProjectFromUI(li.dataset.root, li.dataset.name, li.dataset.color || '');
        };
    });
    list.querySelectorAll('.btn-delete-project').forEach(btn => {
        btn.onclick = () => {
            const li = btn.closest('li');
            if (li) deleteProjectFromUI(li.dataset.root);
        };
    });
}

function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
}
function escapeAttr(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

async function addProjectFromUI() {
    const nameEl = document.getElementById('new-project-name');
    const rootEl = document.getElementById('new-project-root');
    const colorEl = document.getElementById('new-project-color');
    const name = (nameEl && nameEl.value) ? nameEl.value.trim() : '';
    const root = (rootEl && rootEl.value) ? rootEl.value.trim() : '';
    const color = (colorEl && colorEl.value) ? colorEl.value.trim() : '';
    if (!root) {
        alert('Indica la ruta raíz del proyecto.');
        return;
    }
    try {
        const res = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name || undefined, root, color: color || undefined })
        });
        const data = await res.json();
        if (res.ok) {
            fetchData();
            renderProjectsList();
            nameEl.value = '';
            rootEl.value = '';
            if (colorEl) {
                colorEl.value = PROJECT_PALETTE[0].hex;
                selectPaletteChip(document.getElementById('new-project-color-palette'), colorEl.value);
            }
        } else {
            alert(data.detail || 'Error al añadir proyecto');
        }
    } catch (e) {
        console.error(e);
        alert('Error de conexión');
    }
}

function editProjectFromUI(oldRoot, oldName, oldColor) {
    const addSection = document.getElementById('add-project-section');
    const editSection = document.getElementById('edit-project-section');
    const listSection = document.getElementById('projects-list-section');
    if (!editSection || !addSection) return;
    document.getElementById('edit-project-old-root').value = oldRoot;
    document.getElementById('edit-project-name').value = oldName || '';
    document.getElementById('edit-project-root').value = oldRoot || '';
    const defaultColor = PROJECT_PALETTE[0].hex;
    const colorVal = (oldColor && /^#[0-9a-fA-F]{3,8}$/.test(oldColor)) ? oldColor : defaultColor;
    const colorInput = document.getElementById('edit-project-color');
    if (colorInput) colorInput.value = colorVal;
    selectPaletteChip(document.getElementById('edit-project-color-palette'), colorVal);
    addSection.style.display = 'none';
    listSection.style.display = 'none';
    editSection.style.display = 'block';
}

function cancelEditProject() {
    const addSection = document.getElementById('add-project-section');
    const editSection = document.getElementById('edit-project-section');
    const listSection = document.getElementById('projects-list-section');
    if (addSection) addSection.style.display = 'block';
    if (listSection) listSection.style.display = 'block';
    if (editSection) editSection.style.display = 'none';
}

async function saveEditProject() {
    const oldRoot = document.getElementById('edit-project-old-root')?.value ?? '';
    const name = document.getElementById('edit-project-name')?.value?.trim() ?? '';
    const root = document.getElementById('edit-project-root')?.value?.trim() ?? '';
    const colorInput = document.getElementById('edit-project-color');
    const color = colorInput?.value?.trim() ?? '';
    if (!oldRoot) return;
    try {
        const res = await fetch('/api/projects', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                old_root: oldRoot,
                name: name || undefined,
                root: root || undefined,
                color: color || ''
            })
        });
        const data = await res.json();
        if (res.ok && data.status === 'ok') {
            cancelEditProject();
            fetchData();
            renderProjectsList();
        } else {
            alert(data.detail || 'Error al actualizar');
        }
    } catch (e) {
        console.error(e);
        alert('Error de conexión');
    }
}

async function deleteProjectFromUI(root) {
    if (!confirm('¿Eliminar este proyecto de la configuración?')) return;
    try {
        const res = await fetch(`/api/projects?root=${encodeURIComponent(root)}`, { method: 'DELETE' });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
            fetchData();
            renderProjectsList();
        } else {
            alert(data.detail || 'Error al eliminar');
        }
    } catch (e) {
        console.error(e);
        alert('Error de conexión');
    }
}

// Copy to clipboard utility
function copyToClipboard(text, event) {
    navigator.clipboard.writeText(text).then(() => {
        // Visual feedback
        const btn = event.target.closest('.btn-copy-id');
        if (btn) {
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i>';
            btn.style.color = '#10b981';
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.color = '';
            }, 1500);
        }
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Error al copiar al portapapeles');
    });
}
