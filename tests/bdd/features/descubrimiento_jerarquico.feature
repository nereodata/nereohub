Feature: Descubrimiento jerarquico de tareas
  Como usuario quiero que el Hub use el archivo task_config.yaml de cada proyecto
  para descubrir tareas en rutas personalizadas y distinguir niveles.

  Scenario: Descubrimiento de tareas usando rutas personalizadas en task_config.yaml
    Dado que existe un directorio de proyecto "fixtures/custom_project"
    Y existe un archivo "task_config.yaml" en la raiz del proyecto con:
      """
      project:
        prefix: CST
        name: CustomProject
      levels:
        master:
          path: docs/backlog/tasks/
        components:
          - type: package
            id_prefix: CORE
            path: src/core/plan/
      """
    Y existe una tarea maestra en "docs/backlog/tasks/T-CST-0001.md"
    Y existe una tarea de componente en "src/core/plan/T-CST-CORE-0001.md"
    Y hay un proyecto anadido con nombre "Custom" y root "fixtures/custom_project"
    Cuando hago GET a "/api/data"
    Entonces el codigo de respuesta es 200
    Y "masters" contiene una tarea con id "T-CST-0001"
    Y "backlog" contiene una tarea con id "T-CST-CORE-0001"
