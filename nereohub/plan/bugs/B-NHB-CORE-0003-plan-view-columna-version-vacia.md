---
id: B-NHB-CORE-0003
title: "Plan view oculta items sin versión: falta columna 'Sin versión'"
type: bug
weight: 50
version: ""
status: in_progress
effort_unit: h
estimated_effort: 2
remaining_effort: 0.5
actual_effort: 1
created_at: 2026-05-18
updated_at: 2026-05-18
---

### Descripción
El Plan de ejecución descarta de la UI cualquier item cuya `version` sea cadena vacía o ausente. Como tampoco entran en el sidebar de Backlog (que filtra por `status` ∈ {`backlog`,`open`}), las tareas master con `version: ""` y `status: planned|completed` quedan invisibles a pesar de existir en `/api/data`.

**Código responsable:** `frontend/src/components/PlanView.jsx:30-31`

```js
[...data.backlog, ...data.anomalies, ...data.masters].forEach(item => {
  if (item.version && item.version.toLowerCase() !== 'backlog') list.add(item.version);
});
```

La condición `item.version && ...` excluye el string vacío (falsy en JS), por lo que no se crea columna para esos items y se pierden en la pantalla. Análogo en `FilterBar.jsx:91`.

### Comportamiento esperado
- El Plan debe mostrar una columna explícita (etiqueta sugerida: "Sin versión" o "—") con todos los items cuya `version` sea `""` o falte en el frontmatter.
- Esa columna replica la estructura multi-columna interna del resto y soporta drag&drop in/out, persistiendo `version: ""` al mover una tarjeta dentro de ella.
- `FilterBar` y los contadores de versiones la tratan como una versión más; no se oculta.

### Pasos para reproducir
1. Configurar un proyecto en NereoHub cuyo backlog incluya tareas master con frontmatter `version: ""` y `status: planned` o `completed` (p. ej. los 9 masters `T-AIRA-0001..0009` del proyecto AIRA).
2. Llamar a `GET /api/data` y comprobar que la lista `masters` contiene los 9 items.
3. Abrir el Plan de ejecución en la UI.
4. **Esperado:** las 9 tareas aparecen en una columna "Sin versión".
5. **Observado:** no aparecen en ninguna pestaña (ni Plan, ni Backlog).

### Workaround actual
Asignar manualmente una `version` no vacía y distinta de `"backlog"` al frontmatter de cada master afectada. Esto las hace visibles como columna en Plan, pero obliga a los usuarios a forzar versiones aunque semánticamente no la tengan asignada todavía.

### Notas técnicas
- Cambio mínimo: en `PlanView.jsx` introducir un bucket implícito para `version: ""` y renderizarlo como columna adicional con drag&drop equivalente.
- Revisar `App.jsx:213` (Backlog tab usa solo `data.backlog`) para decidir si las masters sin versión deberían además ser accesibles desde esa pestaña, o si el fix sólo debe vivir en Plan view.
- Sincronizar el comportamiento de `FilterBar.jsx:91`.
