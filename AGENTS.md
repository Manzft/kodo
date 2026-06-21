# Kodo

App personal de escritorio con Dashboard, Notas, Recordatorios, Calendario, Rutina, To-Do y Tracking.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite, CSS vanilla |
| Backend | Python 3 + Flask |
| Datos | JSON en `~/.local/share/kodo/` |
| Ejecución | Servidor local + navegador |

## Arquitectura

```
kodo/
├── frontend/
│   └── src/
│       ├── components/    # Sidebar, Modal, Settings, Icons
│       ├── pages/         # Dashboard, Notes, Reminders, Calendar, Todo, Routine, Tracking
│       ├── api.js         # Cliente HTTP para el backend
│       ├── i18n.jsx      # Sistema de traducciones ES/EN con React Context
│       ├── App.jsx        # Layout principal + routing por estado
│       └── App.css        # Estilos globales + variables CSS (dark/light + 6 paletas)
├── backend/
│   ├── routes/            # Blueprints: notes, reminders, calendar, todos, routines, trackers
│   ├── server.py          # Entry point Flask
│   └── storage.py         # Lectura/escritura JSON en ~/.local/share/kodo/
├── install.sh
├── start.sh
├── README.md              # Bilingüe (ES/EN)
└── LICENSE                # MIT
```

## Convenciones

- **CSS**: variables en `:root` + `data-theme` y `data-palette` para tema oscuro/claro y 6 paletas
- **Iconos**: SVG inline en `Icons.jsx`, sin librerías de iconos
- **Routing**: estado local con `useState` en `App.jsx`, sin react-router
- **API**: `fetch` nativo en `api.js`, sin axios
- **Backend**: Flask blueprints, un archivo por módulo en `routes/`
- **IDs**: UUID v4 generados en backend con `uuid.uuid4()`
- **i18n**: `useLang()` hook desde `i18n.jsx`, traducciones con claves anidadas
- **Tema/paleta/idioma**: persistencia en `localStorage`

## Comandos

```bash
./install.sh    # Instala dependencias (una vez)
./start.sh      # Inicia backend + frontend + abre navegador
```

## Módulos

| Módulo | Backend (routes/) | Frontend (pages/) |
|--------|-------------------|-------------------|
| Dashboard | — | Dashboard.jsx |
| Notas | notes.py | Notes.jsx |
| Recordatorios | reminders.py | Reminders.jsx |
| Calendario | calendar.py | Calendar.jsx |
| To-Do | todos.py + topics | Todo.jsx |
| Rutina | routines.py + sessions | Routine.jsx |
| Tracking | trackers.py | Tracking.jsx |

## Diseño

- **Tema oscuro**: fondo `#0d0d14`, sidebar `#14141f`, superficies `#1c1c2e`
- **Tema claro**: fondo `#f0f0f8`, sidebar/superficies blancas
- **6 paletas**: Coral, Rosa, Azul, Verde, Púrpura, Naranja
- **Sidebar**: 240px, logo Kodo (lápiz), navegación + ajustes al fondo
- **Idiomas**: Español e Inglés, conmutables desde Ajustes
- Esquinas redondeadas (8px), flat design

## Estado actual

- Todos los módulos implementados con CRUD completo
- Dashboard con widgets agregados de todos los módulos
- Sistema de i18n ES/EN funcional
- Tema oscuro/claro + 6 paletas de color
- Tracking configurable (fecha inicio, días objetivo, grid calendario)
- Backend verificado, build frontend sin errores
