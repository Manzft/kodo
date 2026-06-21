# Kodo

App personal de escritorio con Dashboard, Notas, Recordatorios, Calendario, Rutina, To-Do y Tracking.

> **Versión:** 1.0

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite, CSS vanilla |
| Backend | Python 3 + Flask |
| Datos | JSON en `~/.local/share/kodo/` |

## Requisitos

- Python 3
- Node.js 18+

## Instalación

```bash
git clone https://github.com/manzft/kodo.git
cd kodo
./install.sh
```

## Uso

```bash
./start.sh
```

Esto inicia el servidor Flask en `http://localhost:5000` y el frontend Vite en `http://localhost:5173`, y abre el navegador.

## Módulos

- **Dashboard** — Resumen con widgets de todos los módulos
- **Notas** — CRUD de notas con grid y modal
- **Recordatorios** — Recordatorios con día y hora, notificaciones, polling automático
- **Calendario** — Eventos en vista mensual
- **Rutina** — Rutinas de ejercicio con historial de sesiones
- **To-Do** — Tareas con prioridades, fechas y temas
- **Tracking** — Seguimiento de hábitos diarios con calendario, metas y rachas

## Personalización

Desde el menú de Ajustes (⚙ en la barra lateral) puedes:

- Cambiar entre tema **oscuro** y **claro**
- Elegir entre **6 paletas de color**: Coral, Rosa, Azul, Verde, Púrpura, Naranja

## Licencia

MIT
