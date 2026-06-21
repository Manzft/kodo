import { useState, useEffect } from 'react'
import {
  getNotes, getReminders, getCalendarEvents, getTodos,
  getSessions, getTrackers,
} from '../api'
import { useLang } from '../i18n'

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
  const { t } = useLang()
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

  if (loading) return <div className="page"><p className="muted">{t('common.loading')}</p></div>
  if (!data) return <div className="page"><p className="muted">{t('common.error')}</p></div>

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
        <h2 className="page-title">{t('dashboard.title')}</h2>
      </div>
      <div className="dashboard-grid">
        <div className="dash-card">
          <div className="dash-card-header" style={{ borderLeftColor: '#f26c8f' }}>
            <span className="dash-card-dot" style={{ background: '#f26c8f' }} />
            <span className="dash-card-title">{t('dashboard.reminders')}</span>
          </div>
          <div className="dash-card-body">
            <div className="dash-stat">{activeReminders.length}</div>
            <div className="dash-stat-label">{t('dashboard.remindersActive')}</div>
            {nextReminder && (
              <div className="dash-list">
                <div className="dash-item">
                  <span className="dash-item-dot" style={{ background: '#f26c8f' }} />
                  <span><strong>{nextReminder.title}</strong></span>
                  <span className="muted">{nextReminder.time && `${nextReminder.time} · `}{nextReminder.day ? ['D', 'L', 'M', 'X', 'J', 'V', 'S'][nextReminder.day] || '' : 'Hoy'}</span>
                </div>
              </div>
            )}
            {activeReminders.length === 0 && <p className="dash-empty">{t('dashboard.noReminders')}</p>}
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-header" style={{ borderLeftColor: '#e6b85c' }}>
            <span className="dash-card-dot" style={{ background: '#e6b85c' }} />
            <span className="dash-card-title">{t('dashboard.todo')}</span>
          </div>
          <div className="dash-card-body">
            <div className="dash-stat">{incompleteTodos.length}</div>
            <div className="dash-stat-label">{t('dashboard.todoPending')}</div>
            {dueTodayTodos.length > 0 && (
              <div className="dash-list">
                <div className="dash-item">
                  <span className="dash-item-dot" style={{ background: '#e6b85c' }} />
                  <span><strong>{dueTodayTodos.length}</strong> {t('dashboard.todoDueToday')}</span>
                </div>
              </div>
            )}
            {incompleteTodos.length === 0 && <p className="dash-empty">{t('dashboard.todoDone')}</p>}
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-header" style={{ borderLeftColor: '#5ca6e6' }}>
            <span className="dash-card-dot" style={{ background: '#5ca6e6' }} />
            <span className="dash-card-title">{t('dashboard.calendar')}</span>
          </div>
          <div className="dash-card-body">
            <div className="dash-stat">{todayEvents.length}</div>
            <div className="dash-stat-label">{t('dashboard.calendarToday')}</div>
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
            {todayEvents.length === 0 && <p className="dash-empty">{t('dashboard.noEvents')}</p>}
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-header" style={{ borderLeftColor: '#6cbf6c' }}>
            <span className="dash-card-dot" style={{ background: '#6cbf6c' }} />
            <span className="dash-card-title">{t('dashboard.routine')}</span>
          </div>
          <div className="dash-card-body">
            {lastSession ? (
              <>
                <div className="dash-stat">{lastSession.routine_name || t('dashboard.routine')}</div>
                <div className="dash-stat-label">{t('dashboard.lastSession')} {localeDate(lastSession.date)}</div>
                {lastSession.duration && (
                  <div className="dash-item">
                    <span className="dash-item-dot" style={{ background: '#6cbf6c' }} />
                    <span>{t('dashboard.duration')} {lastSession.duration} {t('common.min')}</span>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="dash-stat">0</div>
                <div className="dash-stat-label">{t('dashboard.routineSessions')}</div>
                <p className="dash-empty">{t('dashboard.noSessions')}</p>
              </>
            )}
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-header" style={{ borderLeftColor: '#c97cf0' }}>
            <span className="dash-card-dot" style={{ background: '#c97cf0' }} />
            <span className="dash-card-title">{t('dashboard.notes')}</span>
          </div>
          <div className="dash-card-body">
            <div className="dash-stat">{notes.length}</div>
            <div className="dash-stat-label">{t('dashboard.notes')}</div>
            {notes.length > 0 && (
              <div className="dash-list">
                {notes.slice(-3).reverse().map(n => (
                  <div key={n.id} className="dash-item">
                    <span className="dash-item-dot" style={{ background: '#c97cf0' }} />
                    <span>{n.title || t('common.noTitle')}</span>
                  </div>
                ))}
              </div>
            )}
            {notes.length === 0 && <p className="dash-empty">{t('dashboard.noNotes')}</p>}
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-header" style={{ borderLeftColor: '#f29c6c' }}>
            <span className="dash-card-dot" style={{ background: '#f29c6c' }} />
            <span className="dash-card-title">{t('dashboard.tracking')}</span>
          </div>
          <div className="dash-card-body">
            <div className="dash-stat">{todayEntries.length}/{trackers.length}</div>
            <div className="dash-stat-label">{t('dashboard.trackingDone')}</div>
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
            {trackers.length === 0 && <p className="dash-empty">{t('dashboard.noTrackers')}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
