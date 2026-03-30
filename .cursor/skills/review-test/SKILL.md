---
name: review-test
description: Evaluación de la calidad de la suite de pruebas
---

# Skill: Test Review (/review-test-workflow)

Este flujo (ahora skill) audita la suite de pruebas completa y valora su calidad y completitud, alertando si hay deficiencias.

## Pasos de la Skill

### 1. Inventario de Pruebas
Listar todos los archivos `.feature` de la carpeta de features y compararlos con los archivos `test_*.py` de tests (BDD y unitarios) existentes en el código.

### 2. Verificación de Implementación
Confirmar que NO existen features huérfanas (archivos feature sin tests que los implementen) y que todos los escenarios tienen sus Step Definitions implementados.

### 3. Auditoría de Calidad (Test Reviewer)
Analizar y puntuar sobre 10 siguiendo estos tres pilares:
* **Bloque BDD (Contrato de Negocio)**:
  - Penalizar severamente (-5 puntos) si hay *features* huérfanas o escenarios sin steps.
  - Asegurar uso correcto del runner (ej. `pytest-bdd`) y evitar llamadas a runners obsoletos.
  - Trazabilidad con tags de requisitos (`@RF-XXX`).
* **Bloque Unitario (Aislamiento técnico)**:
  - **Pureza**: Garantizar que NO hay accesos directos a BD, red o I/O real (usar mocks y fixtures de pytest).
  - Exigir cobertura *Edge* (casos excepcionales, nulos, asertos negativos).
* **Bloque de Integración (Flujo Real)**:
  - Validar testing del ciclo completo (ej. API -> Base de Datos) y persistencia real de los datos.

### 4. Generar Reporte
Guardar el informe detallado (ej. en `docs/review/test_reviews/`). Debe incluir una sección explícita de "Features Huérfanas" si se detectan.

### 5. Actualización de Plan
Calcular una puntuación global sobre 10. Si el reporte da una puntuación < 8, usar el workflow de registro de anomalías (`/bug-add-workflow` o la skill correspondiente) y actualizar el Execution Plan.

