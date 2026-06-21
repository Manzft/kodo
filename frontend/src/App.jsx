import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Notes from './pages/Notes'
import Reminders from './pages/Reminders'
import Calendar from './pages/Calendar'
import Todo from './pages/Todo'
import Routine from './pages/Routine'
import Tracking from './pages/Tracking'

const pages = {
  dashboard: Dashboard,
  notes: Notes,
  reminders: Reminders,
  calendar: Calendar,
  todo: Todo,
  routine: Routine,
  tracking: Tracking,
}

export default function App() {
  const [page, setPage] = useState('dashboard')
  const Page = pages[page]

  return (
    <div className="app">
      <Sidebar current={page} onNavigate={setPage} />
      <main className="content">
        <Page />
      </main>
    </div>
  )
}
