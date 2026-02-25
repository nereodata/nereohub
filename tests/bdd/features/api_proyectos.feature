Feature: API de proyectos
  Como cliente de la API quiero gestionar proyectos mediante endpoints REST.

  Scenario: GET /api/projects devuelve lista de proyectos
    Dado que no hay proyectos configurados
    Cuando hago GET a "/api/projects"
    Entonces el codigo de respuesta es 200
    Y el JSON tiene la clave "projects"
    Y "projects" es una lista

  Scenario: POST /api/projects anade un proyecto
    Dado que existe un directorio de proyecto en "fixtures/sample_project"
    Cuando hago POST a "/api/projects" con body name "APIProj" y root "fixtures/sample_project"
    Entonces el codigo de respuesta es 200
    Y el JSON tiene "status" igual a "ok"
    Y el JSON tiene "project" con "name" "APIProj"

  Scenario: DELETE /api/projects elimina un proyecto
    Dado que existe un directorio de proyecto en "fixtures/sample_project"
    Y hay un proyecto anadido con root "fixtures/sample_project"
    Cuando hago DELETE a "/api/projects" con query root "fixtures/sample_project"
    Entonces el codigo de respuesta es 200
    Y la lista de proyectos ya no contiene ese root
