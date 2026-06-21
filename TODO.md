# Kodo — Plan de Desarrollo

## Fase 1: Base del Proyecto
- [x] Crear estructura de directorios
- [x] Crear AGENTS.md con plan del proyecto
- [x] Crear TODO.md con desglose de pasos
- [x] Inicializar backend: server.py, storage.py, rutas base
- [x] Inicializar frontend: React + Vite + configuración
- [x] Crear install.sh (instalar deps)
- [x] Crear start.sh (lanzar backend + frontend)
- [x] Verificar que frontend y backend se comunican

## Fase 2: Shell Visual (UI Base)
- [x] Sidebar de navegación con todos los módulos
- [x] Sistema de routing por estado (useState)
- [x] Tema oscuro con acento rosa/coral
- [x] Logo/branding de Kodo
- [ ] Placeholders para módulos no implementados (Recordatorios, Calendario, etc.)

## Fase 3: Módulo Notas
- [x] Backend: API CRUD de notas (GET/POST/PUT/DELETE)
- [x] Backend: Persistencia en JSON
- [x] Frontend: Lista de notas
- [x] Frontend: Crear nota
- [x] Frontend: Editar nota (inline)
- [x] Frontend: Eliminar nota
- [x] Frontend: Editor inline en tarjeta

## Fase 4: Módulo To-Do
- [ ] Backend: API CRUD de tópicos/categorías
- [ ] Backend: API CRUD de tareas
- [ ] Frontend: Lista de tareas por tópico
- [ ] Frontend: Crear/editar/eliminar tareas
- [ ] Frontend: Marcar tarea completada
- [ ] Frontend: Filtrar por tópico

## Fase 5: Módulo Recordatorios
- [ ] Backend: API CRUD de recordatorios
- [ ] Backend: Sistema de verificación periódica (thread)
- [ ] Frontend: Lista de recordatorios
- [ ] Frontend: Crear/editar/eliminar recordatorio
- [ ] Frontend: Notificaciones (sonido/toast)
- [ ] Soporte: one-shot (se desactiva sola) y siempre activa

## Fase 6: Módulo Calendario
- [ ] Backend: API CRUD de eventos
- [ ] Frontend: Vista mensual del calendario
- [ ] Frontend: Crear/editar/eliminar eventos
- [ ] Frontend: Vista de eventos del día

## Fase 7: Módulo Rutina
- [ ] Backend: API CRUD de rutinas y ejercicios
- [ ] Backend: API de sesiones de entrenamiento
- [ ] Frontend: Lista de rutinas
- [ ] Frontend: Crear/editar rutina con ejercicios
- [ ] Frontend: Registrar sesión de entrenamiento
- [ ] Frontend: Historial de sesiones

## Fase 8: Módulo Tracking
- [ ] Backend: API CRUD de trackers
- [ ] Backend: API de entradas por fecha
- [ ] Backend: Estadísticas (frecuencia semanal/mensual/anual)
- [ ] Frontend: Lista de trackers
- [ ] Frontend: Marcar días (calendario/mini-grid)
- [ ] Frontend: Visualizar estadísticas

## Fase 9: Dashboard
- [ ] Backend: Endpoint con datos agregados
- [ ] Frontend: Widget de recordatorios activos
- [ ] Frontend: Widget de eventos próximos
- [ ] Frontend: Widget de tareas pendientes
- [ ] Frontend: Widget de último entrenamiento
- [ ] Frontend: Widget de tracking rápido
- [ ] Frontend: Widget de notas recientes

## Fase 10: Mejoras y Polaco
- [ ] Temas dinámicos (claro/oscuro/personalizado)
- [ ] Atajos de teclado
- [ ] Animaciones y transiciones
- [ ] Responsive / adaptativo
- [ ] Exportación/backup de datos
- [ ] Notificaciones del sistema (desktop)
