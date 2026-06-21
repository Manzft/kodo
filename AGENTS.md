# Kodo

App personal de escritorio con Dashboard, Notas, Recordatorios, Calendario, Rutina, To-Do, Tracking y Chatbot.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite, CSS vanilla |
| Backend | Python 3 + Flask + requests |
| Datos | JSON en `~/.local/share/kodo/` |
| Ejecución | Servidor local + navegador |

## Arquitectura

```
kodo/
├── frontend/
│   └── src/
│       ├── components/    # Sidebar, Modal, Settings, Icons
│       ├── pages/         # Dashboard, Notes, Reminders, Calendar, Todo, Routine, Tracking, Chatbot
│       ├── api.js         # Cliente HTTP para el backend
│       ├── i18n.jsx       # Sistema de traducciones ES/EN con React Context
│       ├── App.jsx        # Layout principal + routing por estado + responsive hamburger
│       └── App.css        # Estilos globales + variables CSS + responsive (≤768px / ≤480px)
├── backend/
│   ├── routes/            # Blueprints: notes, reminders, calendar, todos, routines, trackers, chat
│   ├── server.py          # Entry point Flask
│   └── storage.py         # Lectura/escritura JSON en ~/.local/share/kodo/
├── install.sh
├── start.sh
├── README.md              # Bilingüe (ES/EN)
└── LICENSE                # MIT
```

## Convenciones

- **CSS**: variables en `:root` + `data-theme` y `data-palette` para tema oscuro/claro y 6 paletas; media queries para responsive
- **Iconos**: SVG inline en `Icons.jsx`, sin librerías de iconos
- **Routing**: estado local con `useState` en `App.jsx`, sin react-router
- **API**: `fetch` nativo en `api.js`, sin axios
- **Backend**: Flask blueprints, un archivo por módulo en `routes/`
- **IDs**: UUID v4 generados en backend con `uuid.uuid4()`
- **i18n**: `useLang()` hook desde `i18n.jsx`, traducciones con claves anidadas
- **Tema/paleta/idioma**: persistencia en `localStorage` (`kodo-theme`, `kodo-palette`, `kodo-lang`)
- **Chatbot**: contexto de módulo seleccionable (carga datos del módulo activo como system prompt); proveedores OpenAI-compatibles con selector; API key y modelo persistidos en localStorage

## APK (Android)

Kodo se empaqueta como APK con **Capacitor** (WebView nativo) + **Chaquopy** (Python embebido). Flask corre localmente en el dispositivo sirviendo el frontend build + API.

```
frontend/android/
├── app/src/main/
│   ├── python/                    # Backend Python + frontend build
│   │   ├── kodo_server.py         # Entry point (start Flask)
│   │   ├── backend/               # server.py, storage.py, routes/
│   │   └── static/                # Vite build output (index.html + assets/)
│   ├── java/com/manzft/kodo/
│   │   └── MainActivity.java      # Inicia Python + carga localhost:5000
│   ├── res/xml/
│   │   └── network_security_config.xml
│   └── AndroidManifest.xml
├── build.gradle                   # Chaquopy classpath
├── app/build.gradle               # Chaquopy plugin + python config
└── app/build/outputs/apk/debug/app-debug.apk   # APK generado
```

### Requisitos para build APK

- Android SDK (con `sdkmanager` o Android Studio)
- JDK 17+
- Variables de entorno: `ANDROID_HOME` apuntando al SDK

### Comandos

```bash
./install.sh      # Instala dependencias (una vez)
./start.sh        # Inicia backend + frontend + abre navegador
./build-apk.sh    # Build frontend + embebe en Android + genera APK
```

### APK generado

```
frontend/android/app/build/outputs/apk/debug/app-debug.apk
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
| Chatbot | chat.py (proxy OpenAI-compatible) | Chatbot.jsx |

## Diseño

- **Tema oscuro**: fondo `#0d0d14`, sidebar `#14141f`, superficies `#1c1c2e`
- **Tema claro**: fondo `#f0f0f8`, sidebar/superficies blancas
- **6 paletas**: Coral, Rosa, Azul, Verde, Púrpura, Naranja
- **Sidebar**: 240px (200px en ≤480px), logo Kodo (lápiz), navegación + ajustes al fondo
- **Responsive**: hamburger menu en ≤768px, sidebar como drawer, FABs para crear, modales centrados
- **Idiomas**: Español e Inglés, conmutables desde Ajustes
- Esquinas redondeadas (8px), flat design

## Estado actual

- Todos los módulos implementados con CRUD completo
- Dashboard con widgets agregados de todos los módulos
- Sistema de i18n ES/EN funcional
- Tema oscuro/claro + 6 paletas de color
- Tracking configurable (fecha inicio, días objetivo, grid calendario)
- Chatbot con selector de proveedor (OpenAI, Gemini, DeepSeek, Mistral, Groq, OpenRouter, Together), listado de modelos, y contexto de módulo (carga datos del módulo seleccionado)
- Diseño responsive (≤768px y ≤480px): hamburger, FAB, drawer sidebar
- Backend verificado, build frontend sin errores
