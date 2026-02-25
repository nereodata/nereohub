## Principios de Desarrollo
- **Flujo**: BDD → TDD → Desarrollo → Revisión
- **Tests BDD**: Deben estar en español e incluir referencias a requisitos (`Ref: RF1.1`)
- **Antes de desarrollar**: Confirmar que las pruebas BDD y TDD cubren todos los escenarios

## Convenciones de Código

### Comentarios e Imports
- **NO** añadir comentarios internos tipo "Aquí hacemos X". Solo usar `docstrings` de Python
- **SIEMPRE** colocar todos los imports al principio del archivo, en la sección de imports
- **NO** colocar imports dentro de funciones o métodos
- Mantener imports limpios y evitar imports circulares

### Tematización
- Todos los nuevos controles visuales deben ser "Themeable" o usar colores definidos en `AppColors`
- Respetar los temas Light/Dark en todos los componentes

## Flet 1.0 - Cambios Breaking Críticos

### Inicialización y API Base
- Usar `ft.run(main)` o `ft.run(main=main)` en lugar de `ft.app(target=main)`
- `page.client_storage` cambió a `page.shared_preferences`
- `Page.on_resized` renombrado a `Page.on_resize`
- Remover sufijo `_async` de todos los métodos

### Diálogos y Navegación
- **Usar**: `page.show_dialog(dialog)` y `page.pop_dialog()`
- **NO usar**: `page.open()` o `page.close()` a menos que se confirme explícitamente soporte sin errores

### Componentes y Propiedades
- **Botones**: NO usar propiedad `text`, usar `content=ft.Text("...")` en su lugar
- **Iconos**: `Icon.name` cambió a `Icon.icon`
- **Alignment**: Usar `ft.Alignment.CENTER` (y otras constantes) en lugar de `ft.alignment.center`
- **Padding/Margin**: Usar argumentos nombrados: `ft.Padding(vertical=0, horizontal=10)` en lugar de `ft.Padding.symmetric(0, 10)`
- **Card**: `Card.color` → `Card.bgcolor`, `Card.is_semantic_container` → `Card.semantic_container`
- **Checkbox**: `Checkbox.is_error` → `Checkbox.error`
- **Tabs**: `Tabs.is_secondary` → `Tabs.secondary`
- **Animation**: Usar `ft.Animation` en lugar de `ft.animation.Animation`

### Servicios y Eventos
- **FilePicker**: Es un servicio ahora, debe añadirse a `page.services` y solo proporciona métodos async
- **Theme**: Remover `primary_swatch`, `primary_color`, etc. Usar `color_scheme_seed` y `ColorScheme.primary` en su lugar

### SnackBars
- Usar modo manual para asegurar visibilidad:
  ```python
  self.page.snack_bar = ft.SnackBar(content=ft.Text("Mensaje"), bgcolor=ft.Colors.GREEN)
  self.page.snack_bar.open = True
  self.page.update()
  ```

### Componentes Tematizables
- Preferir componentes de `aprexx.ui.components.themeable` (como `ThemedIconButton`) para sincronización con `ThemeManager`

## Referencias
- **Documentación completa**: Ver `CONTRIBUTING.md` para más detalles y contexto completo del proyecto
- **Flet Docs**: [https://docs.flet.dev/](https://docs.flet.dev/)
- **API Reference**: [https://docs.flet.dev/api-reference/](https://docs.flet.dev/api-reference/)
- **Breaking Changes**: [https://github.com/flet-dev/flet/issues/5238](https://github.com/flet-dev/flet/issues/5238)
