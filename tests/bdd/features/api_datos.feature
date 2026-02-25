Feature: API de datos
  Como cliente quiero obtener contenido y guardar orden.

  Scenario: GET /api/content devuelve contenido
    Dado que existe un directorio de proyecto con plan/T-TEST-001.md en "fixtures/sample_project"
    Y hay un proyecto anadido con nombre "ContentProj" y root "fixtures/sample_project"
    Cuando hago GET a "/api/content" con project_id "ContentProj" y path "plan/T-TEST-001.md"
    Entonces el codigo de respuesta es 200
    Y el JSON tiene la clave "content"
    Y "content" contiene "T-TEST-001"

  Scenario: POST /api/order guarda orden
    Dado que no hay orden previo
    Cuando hago POST a "/api/order" con body {"ProjA": {"T-001": 0, "T-002": 1}}
    Entonces el codigo de respuesta es 200
    Y el JSON tiene "status" igual a "ok"

  Scenario: POST /api/update_task requiere project_id
    Cuando hago POST a "/api/update_task" con body solo id "T-X-001"
    Entonces el codigo de respuesta es 400
    Y el mensaje indica project_id
