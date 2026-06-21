import { useState } from 'react'
import { Dashboard, Notes, Reminders, Calendar, Routine, Todo, Tracking, Chat, Settings as SettingsIcon } from './Icons'
import { useLang } from '../i18n'
import Settings from './Settings'

const items = [
  { id: 'dashboard', icon: Dashboard, key: 'dashboard' },
  { id: 'notes', icon: Notes, key: 'notes' },
  { id: 'reminders', icon: Reminders, key: 'reminders' },
  { id: 'calendar', icon: Calendar, key: 'calendar' },
  { id: 'routine', icon: Routine, key: 'routine' },
  { id: 'todo', icon: Todo, key: 'todo' },
  { id: 'tracking', icon: Tracking, key: 'tracking' },
  { id: 'chatbot', icon: Chat, key: 'chatbot' },
]

export default function Sidebar({ current, onNavigate, mobileOpen, onClose }) {
  const { t } = useLang()
  const [showSettings, setShowSettings] = useState(false)

  const handleNav = (id) => {
    onNavigate(id)
    if (onClose) onClose()
  }

  return (
    <nav className={`sidebar${mobileOpen ? ' sidebar-mobile' : ''}`}>
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
            onClick={() => handleNav(item.id)}
          >
            <item.icon />
            <span>{t(`nav.${item.key}`)}</span>
          </button>
        ))}
      </div>
      <div className="sidebar-bottom">
        <button
          className={`sidebar-btn${showSettings ? ' active' : ''}`}
          onClick={() => setShowSettings(true)}
        >
          <SettingsIcon />
          <span>{t('nav.settings')}</span>
        </button>
      </div>
      <Settings open={showSettings} onClose={() => setShowSettings(false)} />
    </nav>
  )
}
