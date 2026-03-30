---
name: generate-bdd
description: Generates a new BDD feature file following project standards
---

# Skill: Generate BDD (/generate-bdd-workflow)

This workflow (now skill) guides the agent in creating a new BDD feature file. It integrates the core workflow steps and relies on BDD generation standards.

## Pasos de la Skill

### 1. Analyze Request:
* Identify the functionality to be tested.
* Determine the target component (HMI, CTX, AI, LC).

### 2. Estándares (BDD Generator)
*   **Idioma**:
    *   **Header**: Debe incluir `# language: es` en la primera línea.
    *   **Keywords**: Español (`Característica`, `Escenario`, `Dado`, `Cuando`, `Entonces`, `Y`).
    *   **Descripciones**: Español obligatorio.
*   **Tags**:
    *   Usar `@ui` para tests de frontend, `@api` para tests de backend.
    *   Usar tags funcionales descriptivos (ej. `@auth`, `@layout`).
*   **Estructura interna**:
    *   **Característica**: Título en español descriptivo.
    *   **User Story**: "Como [rol], Quiero [acción], Para [beneficio] (Ref: RF-XXX)".
    *   **Escenarios**: Claros, atómicos y en español.

### 3. Redactar Contenido (Plantilla Base):
```gherkin
# language: es
@tag_componente @tag_funcionalidad
Característica: Título de la Funcionalidad (En Español)
  Como [rol de usuario]
  Quiero [realizar una acción]
  Para [obtener un valor] (Ref: RF-XXX)

  Escenario: Descripción del escenario existoso
    Dado que el sistema está en un estado inicial conocido
    Cuando realizo una acción específica
    Entonces el sistema debe responder con el resultado esperado
    Y el estado debe actualizarse
```

### 4. Create File:
* Create the `.feature` file in the appropriate component directory: `<componente>/tests/features/`.

### 5. Review:
* Ask the user to confirm the scenarios before proceeding to step definitions.

