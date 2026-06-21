import { useState } from 'react'
import { Dashboard, Notes, Reminders, Calendar, Routine, Todo, Tracking, Settings as SettingsIcon } from './Icons'
import Settings from './Settings'

const items = [
  { id: 'dashboard', label: 'Dashboard', icon: Dashboard },
  { id: 'notes', label: 'Notas', icon: Notes },
  { id: 'reminders', label: 'Recordatorios', icon: Reminders },
  { id: 'calendar', label: 'Calendario', icon: Calendar },
  { id: 'routine', label: 'Rutina', icon: Routine },
  { id: 'todo', label: 'To-Do', icon: Todo },
  { id: 'tracking', label: 'Tracking', icon: Tracking },
]

export default function Sidebar({ current, onNavigate }) {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <rect width="36" height="36" rx="10" fill="var(--accent)"/>
          <g transform="rotate(-35, 18, 18)">
            <rect x="12.5" y="6" width="11" height="18" rx="1.5" fill="#fff" opacity="0.92"/>
            <polygon points="12.5,24 23.5,24 18,30" fill="#fce6c9"/>
            <polygon points="15.5,26.5 20.5,26.5 18,30" fill="#555"/>
            <rect x="12.5" y="6.5" width="11" height="3" rx="1" fill="#fff" opacity="0.25"/>
          </g>
        </svg>
        <span className="sidebar-brand">Kodo</span>
      </div>
      <div className="sidebar-nav">
        {items.map((item) => (
          <button
            key={item.id}
            className={`sidebar-btn${current === item.id ? ' active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <item.icon />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
      <div className="sidebar-bottom">
        <button
          className={`sidebar-btn${showSettings ? ' active' : ''}`}
          onClick={() => setShowSettings(true)}
        >
          <SettingsIcon />
          <span>Ajustes</span>
        </button>
      </div>
      <Settings open={showSettings} onClose={() => setShowSettings(false)} />
    </nav>
  )
}
