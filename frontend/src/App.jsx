import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Notes from './pages/Notes'
import Reminders from './pages/Reminders'
import Calendar from './pages/Calendar'
import Todo from './pages/Todo'
import Routine from './pages/Routine'
import Tracking from './pages/Tracking'
import Chatbot from './pages/Chatbot'

const pages = {
  dashboard: Dashboard,
  notes: Notes,
  reminders: Reminders,
  calendar: Calendar,
  todo: Todo,
  routine: Routine,
  tracking: Tracking,
  chatbot: Chatbot,
}

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const Page = pages[page]

  useEffect(() => {
    const theme = localStorage.getItem('kodo-theme') || 'dark'
    document.documentElement.setAttribute('data-theme', theme)
  }, [])

  const navigate = (p) => {
    setPage(p)
    setMobileOpen(false)
  }

  return (
    <div className="app">
      <Sidebar current={page} onNavigate={navigate} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <main className="content">
        <button className="hamburger" onClick={() => setMobileOpen((o) => !o)}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="3" y1="5" x2="17" y2="5"/>
            <line x1="3" y1="10" x2="17" y2="10"/>
            <line x1="3" y1="15" x2="17" y2="15"/>
          </svg>
        </button>
        {mobileOpen && <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />}
        <Page />
      </main>
    </div>
  )
}
