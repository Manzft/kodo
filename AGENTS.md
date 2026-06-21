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
├── frontend/              # React + Vite
│   └── src/
│       ├── components/    # Componentes compartidos (Sidebar, etc.)
│       ├── pages/         # Páginas (Dashboard, Notes, etc.)
│       ├── api.js         # Cliente HTTP para el backend
│       ├── App.jsx        # Layout principal + routing
│       └── App.css        # Estilos globales y variables CSS
├── backend/               # Python Flask
│   ├── routes/            # Blueprints (notes.py, etc.)
│   ├── server.py          # Entry point
│   └── storage.py         # Lectura/escritura JSON
├── install.sh
└── start.sh
```

## Convenciones

- **CSS**: variables en `:root` en `App.css`, sin Tailwind ni librerías externas
- **Iconos**: SVG inline en componentes, sin librerías de iconos
- **Routing**: estado local con `useState` en `App.jsx`, sin react-router
- **API**: `fetch` nativo en `api.js`, sin axios
- **Backend**: Flask blueprints, un archivo por módulo en `routes/`
- **IDs**: UUID v4 generados en backend con `uuid.uuid4()`

## Comandos

```bash
./install.sh    # Instala dependencias (una vez)
./start.sh      # Inicia backend + frontend + abre navegador
```

## Diseño

- Fondo oscuro (`#0d0d14`), sidebar (`#14141f`), acento rosa/coral (`#f26c8f`)
- Sidebar izquierda con navegación, contenido a la derecha
- Esquinas redondeadas (8px), flat design
