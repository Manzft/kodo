# Kodo

> **v1.0**

App personal de escritorio con Dashboard, Notas, Recordatorios, Calendario, Rutina, To-Do y Tracking.

---

## 🇪🇸 Español

Aplicación de escritorio personal para organizar tu día a día.

### Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite, CSS vanilla |
| Backend | Python 3 + Flask |
| Datos | JSON en `~/.local/share/kodo/` |

### Requisitos

- Python 3
- Node.js 18+

### Instalación

```bash
git clone https://github.com/manzft/kodo.git
cd kodo
./install.sh
```

### Uso

```bash
./start.sh
```

Inicia el servidor Flask (`localhost:5000`) y el frontend Vite (`localhost:5173`), y abre el navegador.

### Escritorio (Windows / Linux)

```bash
./build-desktop.sh
```

Genera un ejecutable autónomo (`.exe` en Windows, `.AppImage` en Linux) con la app
en su propia ventana, sin necesidad de navegador.

### Módulos

- **Dashboard** — Resumen con widgets de todos los módulos
- **Notas** — CRUD de notas con grid y modal
- **Recordatorios** — Recordatorios con día y hora, notificaciones, polling automático
- **Calendario** — Eventos en vista mensual
- **Rutina** — Rutinas de ejercicio con historial de sesiones
- **To-Do** — Tareas con prioridades, fechas y temas
- **Tracking** — Seguimiento de hábitos diarios con calendario, metas y rachas

### Personalización

Desde el menú de Ajustes (⚙ en la barra lateral):

- Tema **oscuro** / **claro**
- **6 paletas de color**: Coral, Rosa, Azul, Verde, Púrpura, Naranja
- Idioma: **Español** / **English**

---

## 🇬🇧 English

Personal desktop app to organize your daily life.

### Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, vanilla CSS |
| Backend | Python 3 + Flask |
| Data | JSON files at `~/.local/share/kodo/` |

### Requirements

- Python 3
- Node.js 18+

### Installation

```bash
git clone https://github.com/manzft/kodo.git
cd kodo
./install.sh
```

### Usage

```bash
./start.sh
```

Starts the Flask server (`localhost:5000`) and Vite frontend (`localhost:5173`), then opens the browser.

### Desktop (Windows / Linux)

```bash
./build-desktop.sh
```

Generates a standalone executable (`.exe` on Windows, `.AppImage` on Linux)
with the app in its own window, no browser needed.

### Modules

- **Dashboard** — Summary widgets from all modules
- **Notes** — CRUD notes with grid and modal
- **Reminders** — Day/time reminders with notifications and auto-polling
- **Calendar** — Monthly event view
- **Routine** — Exercise routines with session history
- **To-Do** — Prioritized tasks with due dates and topics
- **Tracking** — Daily habit tracking with calendar, goals and streaks

### Customization

From the Settings menu (⚙ in the sidebar):

- **Dark** / **Light** theme
- **6 color palettes**: Coral, Rose, Blue, Green, Purple, Orange
- Language: **Español** / **English**

---

## License / Licencia

MIT — [Manzft](https://github.com/manzft) · 2026
