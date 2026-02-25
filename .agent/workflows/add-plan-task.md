---
description: Añade una tarea del backlog al Plan de Ejecución (sprint/fase)
---

# Workflow: Añadir Tarea al Plan (/add-plan-task)

Este flujo añade tareas del backlog al Plan de Ejecución activo. El plan es simplemente una **lista ordenada de tareas** para una fase/sprint específica. El detalle de cada tarea vive en el backlog.

## Filosofía

- **Plan = Lista de tareas** (qué hacer y en qué orden)
- **Backlog = Detalle de cada tarea** (cómo hacerlo)
- **Workflow `/dev-task` = Proceso de ejecución** (fases de desarrollo)

## Workflow

### 1. Identificar la Tarea

**Entrada:** ID de la tarea del backlog (ej. `TASK-042`)

**Acciones:**
- Buscar en `<paquete>/docs/backlog/TASK-XXX-*.md`
- Verificar que existe y está en estado `backlog`
- Extraer:
  - Título
  - Tipo (feature, enhancement, etc.)
  - Prioridad
  - Estimación de esfuerzo
  - Referencias (RFs, RNFs)

### 2. Identificar el Plan Activo

**Por defecto:** `docs/plan/Plan de Ejecución - Fase 2.md`

**Acciones:**
- Leer el plan actual
- Determinar el siguiente número de bloque/sub-bloque
- Identificar la sección apropiada

### 3. Generar Entrada en el Plan

**Formato simple:**

```markdown
#### X.Y.Z [Título de la Tarea] (RF-XXX, RNF-YYY)

**Backlog:** [TASK-XXX](../../packages/hmi/docs/backlog/TASK-XXX-descripcion.md)  
**Tipo:** feature | enhancement | refactor  
**Prioridad:** critical | high | medium | low  
**Esfuerzo:** XS | S | M | L | XL  
**Estado:** ⚪ No empezado

**Descripción breve:**
[1-2 líneas de contexto]

---
```

**Ejemplo:**

```markdown
#### 3.5.5 Caché de Miniaturas de Imágenes Remotas (RF-7.3)

**Backlog:** [TASK-001](../../packages/hmi/docs/backlog/TASK-001-cache-miniaturas-remotas.md)  
**Tipo:** enhancement  
**Prioridad:** medium  
**Esfuerzo:** M (1-2 días)  
**Estado:** ⚪ No empezado

**Descripción breve:**
Implementar sistema de caché local para miniaturas de bancos cloud, reduciendo tiempo de carga >70%.

---
```

### 4. Insertar en el Plan

**Acciones:**
- Usar `replace_file_content` para insertar la entrada
- Mantener numeración secuencial
- Insertar en la sección apropiada (generalmente al final)

### 5. Actualizar el Backlog

**Acciones:**
- Actualizar el archivo `TASK-XXX-*.md`:
  ```yaml
  status: planned
  sprint: Fase 2 - Bloque 3.5.5
  updated_at: YYYY-MM-DD
  ```
- Añadir entrada al historial:
  ```markdown
  | 2026-02-07 | Añadida al plan (Fase 2 - Bloque 3.5.5) | Antigravity AI |
  ```

### 6. Actualizar Índice Global del Backlog

**Acciones:**
- Actualizar `docs/plan/Backlog.md`:
  ```markdown
  | TASK-001 | ... | ... | ... | ... | 🔵 Planned | ... |
  ```
- Actualizar estadísticas:
  ```markdown
  - **Backlog:** X
  - **Planificadas:** Y
  ```

### 7. Confirmar

Mostrar al usuario:
- Tarea añadida al plan (bloque X.Y.Z)
- Estado actualizado en backlog
- Link al archivo de la tarea

## Actualización de Estado Durante Desarrollo

Cuando se ejecuta `/dev-task TASK-XXX`, el plan se actualiza automáticamente:

```markdown
**Estado:** 🟡 En curso
```

Al completar:

```markdown
**Estado:** ✅ Completado
```

## Ejemplo Completo

### **Usuario:**
```
/add-plan-task TASK-001
```

### **Sistema:**

1. **Lee backlog:**
   - `packages/hmi/docs/backlog/TASK-001-cache-miniaturas-remotas.md`
   - Título: "Implementar caché de miniaturas de imágenes remotas"
   - Tipo: enhancement
   - Prioridad: medium
   - Esfuerzo: M

2. **Genera entrada para el plan:**

```markdown
#### 3.5.5 Caché de Miniaturas de Imágenes Remotas (RF-7.3)

**Backlog:** [TASK-001](../../packages/hmi/docs/backlog/TASK-001-cache-miniaturas-remotas.md)  
**Tipo:** enhancement  
**Prioridad:** medium  
**Esfuerzo:** M (1-2 días)  
**Estado:** ⚪ No empezado

**Descripción breve:**
Implementar sistema de caché local para miniaturas de bancos cloud usando IndexedDB, con TTL de 24h y estrategia LRU.

---
```

3. **Inserta en `Plan de Ejecución - Fase 2.md`**

4. **Actualiza `TASK-001-cache-miniaturas-remotas.md`:**
   ```yaml
   status: planned
   sprint: Fase 2 - Bloque 3.5.5
   updated_at: 2026-02-07
   ```

5. **Actualiza `docs/plan/Backlog.md`:**
   ```markdown
   | TASK-001 | ... | ... | ... | ... | 🔵 Planned | ... |
   ```

6. **Confirma:**
   ```
   ✅ Tarea TASK-001 añadida al plan como bloque 3.5.5
   📋 Backlog actualizado: status=planned, sprint=Fase 2 - Bloque 3.5.5
   🔗 Ver tarea: packages/hmi/docs/backlog/TASK-001-cache-miniaturas-remotas.md
   ```

## Formato del Plan (Simplificado)

```markdown
# Plan de Ejecución - Fase 2

## Objetivos de la Fase

[Descripción de objetivos generales]

## Tareas Planificadas

### 3.1 Bloque de Arquitectura

#### 3.1.1 Implementar Repository Pattern (RF-2.1)

**Backlog:** [TASK-015](../../packages/context/docs/backlog/TASK-015-repository-pattern.md)  
**Tipo:** refactor  
**Prioridad:** high  
**Esfuerzo:** L (3-5 días)  
**Estado:** ✅ Completado

**Descripción breve:**
Implementar patrón Repository con soporte para SQLite y PostgreSQL.

---

#### 3.1.2 Configurar Sidecar para Desktop (RF-2.2)

**Backlog:** [TASK-016](../../apps/desktop/docs/backlog/TASK-016-sidecar-config.md)  
**Tipo:** feature  
**Prioridad:** high  
**Esfuerzo:** M (1-2 días)  
**Estado:** 🟡 En curso

**Descripción breve:**
Configurar backend como sidecar en aplicación Electron.

---

### 3.2 Bloque de UI

#### 3.2.1 Implementar Dashboard con Cross-Filtering (RF-4.1)

**Backlog:** [TASK-025](../../packages/hmi/docs/backlog/TASK-025-dashboard-crossfilter.md)  
**Tipo:** feature  
**Prioridad:** medium  
**Esfuerzo:** L (3-5 días)  
**Estado:** ⚪ No empezado

**Descripción breve:**
Dashboard interactivo con filtrado cruzado entre tablas y gráficos.

---

## Métricas de la Fase

- **Total tareas:** 15
- **Completadas:** 5 (33%)
- **En curso:** 3 (20%)
- **Pendientes:** 7 (47%)
- **Esfuerzo total:** 35 días
- **Esfuerzo completado:** 12 días (34%)
```

## Ventajas de Este Enfoque

### **1. Simplicidad**
- Plan es fácil de leer y mantener
- No duplica información del backlog
- Cambios solo en un lugar (backlog)

### **2. Flexibilidad**
- Fácil reorganizar tareas (solo mover bloques)
- Fácil repriorizar (cambiar orden)
- Fácil mover tareas entre fases

### **3. Trazabilidad**
- Link directo al backlog para detalles
- Estado sincronizado automáticamente
- Historial completo en backlog

### **4. Escalabilidad**
- Plan no crece descontroladamente
- Backlog puede tener cientos de tareas
- Fácil generar reportes y métricas

## Comandos Relacionados

- `/add-backlog-task` - Crear tarea en backlog
- `/add-plan-task` - Añadir tarea al plan (este workflow)
- `/dev-task` - Ejecutar desarrollo de tarea
- `/commit` - Generar commit message

## Notas Importantes

1. **Plan = Lista ordenada:** No duplicar detalles del backlog
2. **Backlog = Fuente de verdad:** Todo el detalle vive aquí
3. **Sincronización:** Actualizar backlog al añadir al plan
4. **Estado:** Actualizar en plan durante `/dev-task`
5. **Métricas:** Generar desde backlog, no desde plan
