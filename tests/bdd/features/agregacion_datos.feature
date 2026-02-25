Feature: Agregacion de datos
  Como usuario quiero que el Hub descubra y agregue tareas de varios proyectos.

  Scenario: GET /api/data sin proyectos devuelve estructura vacia
    Dado que no hay proyectos configurados
    Cuando hago GET a "/api/data"
    Entonces el codigo de respuesta es 200
    Y el JSON tiene "projects" como lista vacia
    Y el JSON tiene "masters" como lista
    Y el JSON tiene "backlog" como lista
    Y el JSON tiene "anomalies" como lista
    Y el JSON tiene "stats"

  Scenario: GET /api/data con un proyecto devuelve tareas con project_id
    Dado que existe un directorio de proyecto con plan y tareas en "fixtures/sample_project"
    Y hay un proyecto anadido con nombre "AggProj" y root "fixtures/sample_project"
    Cuando hago GET a "/api/data"
    Entonces el codigo de respuesta es 200
    Y "masters" tiene al menos un elemento
    Y cada elemento en "masters" tiene "project_id" o "project" igual a "AggProj"
