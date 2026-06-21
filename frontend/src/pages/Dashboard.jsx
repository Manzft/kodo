import { useState, useEffect } from 'react'
import {
  getNotes, getReminders, getCalendarEvents, getTodos,
  getSessions, getTrackers,
} from '../api'

function pad2(n) { return String(n).padStart(2, '0') }

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function localeDate(dateStr) {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const now = new Date()
        const y = now.getFullYear()
        const m = now.getMonth() + 1
        const td = todayStr()

        const [notes, reminders, events, todos, sessions, trackers] = await Promise.all([
          getNotes().catch(() => []),
          getReminders().catch(() => []),
          getCalendarEvents(y, m).catch(() => []),
          getTodos().catch(() => []),
          getSessions().catch(() => []),
          getTrackers().catch(() => []),
        ])

        if (!cancelled) setData({ notes, reminders, events, todos, sessions, trackers, today: td })
      } catch (e) {
        console.error(e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (loading) return <div className="page"><p className="muted">Cargando...</p></div>
  if (!data) return <div className="page"><p className="muted">Error al cargar datos.</p></div>

  const { notes, reminders, events, todos, sessions, trackers, today: td } = data

  const activeReminders = reminders.filter(r => r.active)
  const nextReminder = activeReminders.length > 0
    ? activeReminders.slice().sort((a, b) => {
        const aVal = `${a.day || ''} ${a.time || ''}`
        const bVal = `${b.day || ''} ${b.time || ''}`
        return aVal.localeCompare(bVal)
      })[0]
    : null

  const todayEvents = events.filter(e => e.date === td)

  const incompleteTodos = todos.filter(t => !t.done)
  const dueTodayTodos = incompleteTodos.filter(t => t.due_date === td)

  const lastSession = sessions.length > 0 ? sessions[sessions.length - 1] : null

  const todayEntries = trackers.filter(t =>
    (t.entries || []).some(e => e.date === td)
  )

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Dashboard</h2>
      </div>
      <div className="dashboard-grid">
        {/* Recordatorios */}
        <div className="dash-card">
          <div className="dash-card-header" style={{ borderLeftColor: '#f26c8f' }}>
            <span className="dash-card-dot" style={{ background: '#f26c8f' }} />
            <span className="dash-card-title">Recordatorios</span>
          </div>
          <div className="dash-card-body">
            <div className="dash-stat">{activeReminders.length}</div>
            <div className="dash-stat-label">activos</div>
            {nextReminder && (
              <div className="dash-list">
                <div className="dash-item">
                  <span className="dash-item-dot" style={{ background: '#f26c8f' }} />
                  <span><strong>{nextReminder.title}</strong></span>
                  <span className="muted">{nextReminder.time && `${nextReminder.time} · `}{nextReminder.day ? ['D', 'L', 'M', 'X', 'J', 'V', 'S'][nextReminder.day] || '' : 'Hoy'}</span>
                </div>
              </div>
            )}
            {activeReminders.length === 0 && <p className="dash-empty">Sin recordatorios activos</p>}
          </div>
        </div>

        {/* To-Do */}
        <div className="dash-card">
          <div className="dash-card-header" style={{ borderLeftColor: '#e6b85c' }}>
            <span className="dash-card-dot" style={{ background: '#e6b85c' }} />
            <span className="dash-card-title">To-Do</span>
          </div>
          <div className="dash-card-body">
            <div className="dash-stat">{incompleteTodos.length}</div>
            <div className="dash-stat-label">tareas pendientes</div>
            {dueTodayTodos.length > 0 && (
              <div className="dash-list">
                <div className="dash-item">
                  <span className="dash-item-dot" style={{ background: '#e6b85c' }} />
                  <span><strong>{dueTodayTodos.length}</strong> vencen hoy</span>
                </div>
              </div>
            )}
            {incompleteTodos.length === 0 && <p className="dash-empty">Todo completado</p>}
          </div>
        </div>

        {/* Calendario */}
        <div className="dash-card">
          <div className="dash-card-header" style={{ borderLeftColor: '#5ca6e6' }}>
            <span className="dash-card-dot" style={{ background: '#5ca6e6' }} />
            <span className="dash-card-title">Calendario</span>
          </div>
          <div className="dash-card-body">
            <div className="dash-stat">{todayEvents.length}</div>
            <div className="dash-stat-label">eventos hoy</div>
            {todayEvents.length > 0 && (
              <div className="dash-list">
                {todayEvents.slice(0, 3).map(e => (
                  <div key={e.id} className="dash-item">
                    <span className="dash-item-dot" style={{ background: '#5ca6e6' }} />
                    <span>{e.title}</span>
                    {!e.all_day && e.start_time && <span className="muted">{e.start_time}</span>}
                  </div>
                ))}
              </div>
            )}
            {todayEvents.length === 0 && <p className="dash-empty">Sin eventos hoy</p>}
          </div>
        </div>

        {/* Rutina */}
        <div className="dash-card">
          <div className="dash-card-header" style={{ borderLeftColor: '#6cbf6c' }}>
            <span className="dash-card-dot" style={{ background: '#6cbf6c' }} />
            <span className="dash-card-title">Rutina</span>
          </div>
          <div className="dash-card-body">
            {lastSession ? (
              <>
                <div className="dash-stat">{lastSession.routine_name || 'Sesión'}</div>
                <div className="dash-stat-label">última sesión: {localeDate(lastSession.date)}</div>
                {lastSession.duration && (
                  <div className="dash-item">
                    <span className="dash-item-dot" style={{ background: '#6cbf6c' }} />
                    <span>Duración: {lastSession.duration} min</span>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="dash-stat">0</div>
                <div className="dash-stat-label">sesiones registradas</div>
                <p className="dash-empty">Sin sesiones aún</p>
              </>
            )}
          </div>
        </div>

        {/* Notas */}
        <div className="dash-card">
          <div className="dash-card-header" style={{ borderLeftColor: '#c97cf0' }}>
            <span className="dash-card-dot" style={{ background: '#c97cf0' }} />
            <span className="dash-card-title">Notas</span>
          </div>
          <div className="dash-card-body">
            <div className="dash-stat">{notes.length}</div>
            <div className="dash-stat-label">notas</div>
            {notes.length > 0 && (
              <div className="dash-list">
                {notes.slice(-3).reverse().map(n => (
                  <div key={n.id} className="dash-item">
                    <span className="dash-item-dot" style={{ background: '#c97cf0' }} />
                    <span>{n.title || 'Sin título'}</span>
                  </div>
                ))}
              </div>
            )}
            {notes.length === 0 && <p className="dash-empty">Sin notas</p>}
          </div>
        </div>

        {/* Tracking */}
        <div className="dash-card">
          <div className="dash-card-header" style={{ borderLeftColor: '#f29c6c' }}>
            <span className="dash-card-dot" style={{ background: '#f29c6c' }} />
            <span className="dash-card-title">Tracking</span>
          </div>
          <div className="dash-card-body">
            <div className="dash-stat">{todayEntries.length}/{trackers.length}</div>
            <div className="dash-stat-label">trackers hechos hoy</div>
            {trackers.length > 0 && (
              <div className="dash-list">
                {trackers.slice(0, 4).map(t => {
                  const done = (t.entries || []).some(e => e.date === td)
                  return (
                    <div key={t.id} className="dash-item">
                      <span className="dash-item-dot" style={{ background: done ? '#6cbf6c' : '#444' }} />
                      <span className={done ? '' : 'muted'}>{t.name}</span>
                      {done && <span style={{ color: '#6cbf6c', fontSize: '0.75rem' }}>✓</span>}
                    </div>
                  )
                })}
              </div>
            )}
            {trackers.length === 0 && <p className="dash-empty">Sin trackers</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
