---
name: task-generator
description: Generates development tasks following Nereodata standards (BDD -> TDD -> Review -> Dev -> Review -> Doc)
---

# Task Generator Skill

This skill ensures every new task added to the Execution Plan follows the strict workflow defined in `.cursorrules`.

## Workflow

1. **Understand Requirements**:
   - Identify the functional requirements (RF) and non-functional requirements (RNF) involved.
   - Determine the target layer: Frontend (React), Backend (FastAPI), or Electron.

2. **Structure the Task**:
   - Use the mandatory template with these specific steps:
     1. **BDD**: Define scenarios in Gherkin (Spanish). Link to RFs.
     2. **TDD**: Define unit tests in the appropriate language (Python/TS).
     3. **Test Review**: Execution of `./docs/prompts/test_review.prompt`.
     4. **Human in the Loop**: Manual check point.
     5. **Development**: Technical implementation details.
     6. **Code Review**: Execution of `./docs/prompts/code_review.prompt`.
     7. **Improvement Iteration**: (Optional) For scores < 8.
     8. **Documentation**: Technical design and updates.

3. **Check Quality**:
   - Ensure the task is atomic and verifiable.
   - Verify that BDD scenarios cover edge cases.
   - Verify that TDD tests target key logic paths.

## Mandatory Template

```markdown
### X.Y [Title] (RF-XXX, RNF-XXX)
- [ ] **1. BDD**:
  - [ ] Escenario: [Description in Spanish] (`Ref: RF-XXX`).
  - [ ] [Añadir todos los escenarios necesarios...]
- [ ] **2. TDD**:
  - [ ] Test: [Logic test description].
  - [ ] [Añadir todos los tests necesarios...]
- [ ] **3. Revisión de test**: Ejecutar `./docs/prompts/test_review.prompt`. **Criterio: Todas las puntuaciones >= 8.**
- [ ] **4. Revisión human in the loop** - Casilla para el usuario.
- [ ] **5. Desarrollo**:
  - [ ] [Technical task 1].
- [ ] **6. Revisión de código**: Ejecutar `./docs/prompts/code_review.prompt`. **Criterio: Todas las puntuaciones >= 8.**
- [ ] **7. Iteración de mejora** (si puntuación < 8): Máximo 3 iteraciones.
- [ ] **8. Documentación y Cierre**:
  - [ ] Generar documentación técnica.
  - [ ] **Cierre de tarea**: Detallar solución, enlaces a doc y rutas de archivos de test.
```
