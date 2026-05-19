---
id: B-NHB-CORE-0005
title: "Enlaces a tareas maestra/hijas no abren la tarjeta correspondiente"
type: bug
weight: 80
version: ""
status: completed
effort_unit: h
estimated_effort: 3
remaining_effort: 0
actual_effort: 1.5
created_at: 2026-05-19
updated_at: 2026-05-19
---

### Descripción
En el modal de detalle de una tarea (`frontend/src/components/Modal.jsx`), las referencias a la tarea maestra o a tareas hijas que aparecen en el cuerpo Markdown se renderizan como **texto plano** y no son clicables. El usuario ve el ID de la tarea relacionada pero no puede saltar a su tarjeta desde la vista actual.

**Causa raíz:** En los `.md` de las master tasks (p. ej. `plan/tasks/T-NHB-0001-lectura-task-config-proyectos.md:28-29`), las hijas se listan con sintaxis no-link de Markdown:

```markdown
- [x] [T-NHB-CORE-0001: Implementar lector de task_config.yaml]
- [x] [T-NHB-CORE-0002: Actualizar lógica de discovery.py para usar task_config]
```

Es un patrón `[texto]` sin `(url)` adjunta, por lo que `marked.parse(content)` lo emite como texto literal (no como `<a>`). El relleno se hace con `dangerouslySetInnerHTML` (`Modal.jsx:114`), sin ninguna capa que detecte IDs de tarea/bug para convertirlos en navegación interna.

**Alcance:**
- Maestra → hijas: aplica a todos los masters que listan componentes (p. ej. `T-NHB-0001..0006`).
- Hija → maestra: actualmente las hijas no referencian al master en su cuerpo, pero el `frontmatter.parent_id` (cuando esté presente) también debería ser navegable desde el header del modal.

### Comportamiento esperado
1. Cualquier ID con la forma `T-[PRJ]-[COMP?]-NNNN` o `B-[PRJ]-[COMP?]-NNNN` que aparezca dentro del contenido renderizado del modal debe convertirse en un control clicable.
2. Al pulsar sobre él, el modal actual debe cerrarse (o reemplazar su contenido) y abrir la tarjeta de la tarea/bug referenciada, igual que si se hubiese hecho click en su `TaskCard`.
3. Si el ID no existe en el dataset actual (`/api/data`), el control se debe renderizar como texto plano (o con estilo "rota") y no fallar.
4. Adicionalmente, el header del modal debe mostrar un acceso directo al master cuando la tarea abierta tenga `parent_id` resoluble, y a las hijas conocidas cuando sea master (vía `data.masters`/`data.backlog` + `parent_id`).

### Pasos para reproducir
1. Abrir NereoHub con un proyecto cuyas master tasks listen hijas (NereoHub mismo sirve: master `T-NHB-0001`).
2. Hacer click sobre la tarjeta de la master para abrir el modal.
3. **Esperado:** los IDs `T-NHB-CORE-0001` y `T-NHB-CORE-0002` son clicables y abren la tarjeta de la hija.
4. **Observado:** se renderizan como texto plano dentro de un bullet; el click no hace nada.

### Propuesta de solución
Dos piezas separadas para minimizar acoplamiento:

**A. Post-proceso del HTML renderizado en `Modal.jsx`**
- Tras `marked.parse(...)`, montar el HTML en un nodo desconectado (`DOMParser` o `document.createElement('div')`), recorrer los nodos de texto y reemplazar las coincidencias de la regex `\b[TB]-[A-Z0-9]+(?:-[A-Z0-9]+)*-\d{4}\b` por un `<button class="task-link" data-task-id="...">…</button>`.
- Antes de inyectar, marcar como `task-link-broken` aquellos IDs que no estén presentes en el índice de items.
- Pasar al modal una nueva prop `onOpenById(id)` desde `App.jsx`, que delega en `setActiveItem(lookup(id))`.
- Adjuntar un único listener delegado (`onClick`) al contenedor `task-detail-rendering` que, si `target.dataset.taskId`, llama a `onOpenById`.

**B. Navegación maestra ↔ hija en el header del modal**
- Construir desde `App.jsx` un índice `byId` y un `childrenByParent` a partir de `data.backlog + data.anomalies + data.masters`.
- En el `task-metadata-subheader` añadir un control "↑ Master" cuando `item.parent_id` exista, y un selector/expandible "Hijas (n)" cuando sea master, con click → `onOpenById`.

**Decisión de alcance:** la corrección vive enteramente en NereoHub. No se reescriben los `.md` de los planes para añadir URLs Markdown — el ID es identificador canónico suficiente y desacoplar el contenido del visualizador es deliberado.

### Resolución
Implementado en frontend (NereoHub), sin tocar los planes:

- **Nuevo módulo `frontend/src/utils/taskLinks.js`**: utilidad pura con `TASK_ID_REGEX` (case-sensitive, `\b[TB]-[A-Z]+(?:-[A-Z]+)*-\d{4}\b`), `wrapTaskIds(html, knownIds)` y `extractTaskIdFromText(text)`. La transformación de HTML salta segmentos dentro de `<pre>`, `<code>` y `<a>` para no romper bloques de código ni envolver IDs dentro de enlaces ya formados. Los IDs reconocidos se sustituyen por `<button class="task-link" data-task-id="…">`; los no reconocidos por `<span class="task-link task-link-broken">` (estilo tachado, no clicable).
- **`frontend/src/components/Modal.jsx`**: el HTML renderizado por `marked.parse` se pasa por `wrapTaskIds` antes de inyectarse. Un único listener delegado en `article.task-detail-rendering` detecta clicks sobre `[data-task-id]` y, como fallback, sobre `<a>` cuyo texto empieza con un ID conocido (caso "🔗 Tarea Maestra" de las hijas), llamando a `onOpenById(id)`. Se añade una barra de jerarquía bajo los metadatos con un acceso "↑ Maestra" cuando `parent_id` es resoluble y un desplegable "Hijas (n)" cuando la tarea es master.
- **`frontend/src/App.jsx`**: calcula `byId`, `knownIds`, `childrenByParent`, `selectedParent`, `selectedChildren` a partir de `data.backlog + data.anomalies + data.masters` y los pasa al `Modal` junto con `openTaskById`.
- **CSS (`frontend/src/index.css`)**: estilos para `.task-hierarchy-bar`, `.task-hierarchy-link/-toggle/-children-list` y `.task-link/-broken` dentro de `.task-detail-rendering`.
- **Build sincronizado**: `frontend/dist/` regenerado y copiado a `nereohub/static/` para que el endpoint estático sirva la versión actualizada.

**Smoke tests (Node, sin runner permanente):** 7 casos verificados sobre `wrapTaskIds` — wrap correcto en bullets, skip dentro de `<code>`/`<pre>`/`<a>`, span tachado para IDs inexistentes, IDs de bug, e insensibilidad a minúsculas. `extractTaskIdFromText` valida el caso del anchor `T-NHB-0001: …`. No hay infra de tests JS instalada; si quieres añadir `vitest` se gestiona en una tarea aparte.

**Verificación end-to-end pendiente:** levantar `npm run dev`/`scripts/nereohub.sh` y abrir el modal de `T-NHB-0001` para confirmar que los IDs son clicables y abren la hija (y viceversa con la barra "↑ MAESTRA" desde `T-NHB-CORE-0001`).

### Notas técnicas
- El reemplazo debe operar **sólo sobre nodos de texto**, no sobre atributos ni dentro de `<code>`/`<pre>`, para no romper bloques de código que contengan IDs.
- Mantener `dangerouslySetInnerHTML` está bien si el post-proceso se hace sobre el árbol creado fuera del DOM y se inyecta el resultado ya sanitizado; no añadir nuevas superficies de XSS.
- La regex debe ser case-sensitive (los IDs son siempre en mayúsculas según convención) para evitar falsos positivos en prosa.
- Tests: añadir caso en `tests/` que valide la transformación (string Markdown → HTML con `task-link` y `data-task-id` esperados, y que un ID inexistente queda como `task-link-broken`).
- Coordinar con `B-NHB-CORE-0004` (filtro por ID): la misma regex de detección de IDs puede reutilizarse en ambos sitios para no divergir.
