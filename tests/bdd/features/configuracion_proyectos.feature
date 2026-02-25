Feature: Configuracion de proyectos
  Como usuario quiero gestionar mis proyectos desde la aplicacion.

  Scenario: Listar proyectos cuando no hay ninguno
    Dado que no hay proyectos configurados
    Cuando solicito la lista de proyectos
    Entonces la respuesta contiene una lista vacia de proyectos

  Scenario: Anadir un proyecto con nombre y ruta validos
    Dado que no hay proyectos configurados
    Y existe un directorio de proyecto en "fixtures/sample_project"
    Cuando anado el proyecto con nombre "MiProyecto" y ruta "fixtures/sample_project"
    Entonces la respuesta indica exito
    Y la lista de proyectos contiene un proyecto con nombre "MiProyecto"

  Scenario: No se puede anadir un proyecto con ruta inexistente
    Dado que no hay proyectos configurados
    Cuando intento anadir el proyecto con nombre "X" y ruta "/ruta/inexistente"
    Entonces la respuesta indica error
    Y el mensaje indica que la ruta no existe
