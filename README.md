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

#### Windows

```powershell
git clone https://github.com/manzft/kodo.git
cd kodo
.\install.ps1
```

### Uso

```bash
./start.sh
```

#### Windows

```powershell
.\start.ps1
```

Inicia el servidor Flask (`localhost:5000`) y el frontend Vite (`localhost:5173`), y abre el navegador.

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

#### Windows

```powershell
git clone https://github.com/manzft/kodo.git
cd kodo
.\install.ps1
```

### Usage

```bash
./start.sh
```

#### Windows

```powershell
.\start.ps1
```

Starts the Flask server (`localhost:5000`) and Vite frontend (`localhost:5173`), then opens the browser.

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
