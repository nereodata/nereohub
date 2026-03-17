Feature: Actualización de estado de tareas
  Como usuario de NereoHub quiero cambiar el estado de una tarea desde las tarjetas
  para mantener sincronizado el frontmatter con la vista sin editar archivos manualmente.

  Scenario: Cambio de estado desde backlog a planned actualiza el archivo
    Dado que existe un directorio de proyecto con plan y tareas en "fixtures/sample_project"
    Y hay un proyecto añadido con nombre "StatusProj" y root "fixtures/sample_project"
    Y la tarea T-TEST-001 tiene status "backlog"
    Cuando hago POST a "/api/update_task" con id "T-TEST-001", project_id "StatusProj" y status "planned"
    Entonces el codigo de respuesta es 200
    Y el JSON tiene "status" igual a "ok"
    Y la tarea T-TEST-001 tiene status "planned" en disco

  Scenario: Estado no permitido devuelve error sin modificar archivo
    Dado que existe un directorio de proyecto con plan y tareas en "fixtures/sample_project"
    Y hay un proyecto añadido con nombre "StatusProj" y root "fixtures/sample_project"
    Y la tarea T-TEST-001 tiene status "planned"
    Cuando hago POST a "/api/update_task" con id "T-TEST-001", project_id "StatusProj" y status "invalid_status"
    Entonces el codigo de respuesta es 400
    Y la tarea T-TEST-001 mantiene status "planned" en disco
