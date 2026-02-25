---
description: Evaluación de la calidad de la suite de pruebas usando el skill test-reviewer
---

# Test Review Workflow

1.  **Inventario de Pruebas**: Listar todos los archivos `.feature` y compararlos con los archivos `test_*.py` (BDD) existentes.
2.  **Verificación de Implementación**: Confirmar que NO existen features huérfanas y que todos los escenarios tienen sus Step Definitions implementados.
3.  **Auditoría de Calidad**: Usar el skill `test-reviewer` para puntuar cada bloque según criterios técnicos de aislamiento, mocks y cobertura de casos borde.
4.  **Generar Reporte**: Guardar el informe detallado en `docs/review/test_reviews/`. Incluir sección de "Features Huérfanas" si se detectan.
5.  **Actualización de Plan**: Si el reporte da una puntuación < 8, registrar anomalías (/add-bug) y actualizar el Execution Plan.
