name: bdd-generator
---

# BDD Generator Skill

This skill ensures that all Behavior Driven Development (BDD) feature files follow the project's strict conventions.

## Standards

1.  **Language**:
    *   **Header**: Must include `# language: es` at the top of the file.
    *   **Keywords**: Spanish (`Característica`, `Escenario`, `Dado`, `Cuando`, `Entonces`, `Y`).
    *   **Content/Descriptions**: **Spanish**.
2.  **Location**:
    *   Packages: `packages/<package>/tests/features/<feature_name>.feature`
    *   Legacy/Root (if applicable): `tests/features/`
3.  **Tags**:
    *   Use `@ui` for frontend tests.
    *   Use `@api` for backend tests.
    *   Use functional tags (e.g., `@auth`, `@layout`, `@files`).
4.  **Structure**:
    *   **Característica**: Title in Spanish describing the functionality.
    *   **User Story**: "Como [rol], Quiero [acción], Para [beneficio] (Ref: RF-XXX)".
    *   **Escenarios**: Clear, atomic scenarios in Spanish.

## Template

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

  Escenario: Descripción de un escenario de error
    Dado que el sistema tiene una condición previa
    Cuando realizo una acción inválida
    Entonces debo ver un mensaje de error explicativo
```

## Instructions for Agent

1.  **Receive Intent**: Identify the feature the user wants to test.
2.  **Consult Plan**: Check `docs/plan/Plan de Ejecución - Fase 2.md` for RF/RNF references.
3.  **Generate File**: Create the `.feature` file using the template above (don't forget `# language: es`).
4.  **Validate**: Ensure full Spanish localization is used for keywords.
