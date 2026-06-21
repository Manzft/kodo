import { useState, useEffect } from 'react'
import { getTrackers, createTracker, updateTracker, deleteTracker, toggleTrackerEntry, getTrackerStats } from '../api'
import Modal from '../components/Modal'

const EMPTY_FORM = { name: '', description: '', start_date: '', target_days: 30 }

function pad2(n) {
  return String(n).padStart(2, '0')
}

function apiDate(y, m, d) {
  return `${y}-${pad2(m + 1)}-${pad2(d)}`
}

function monthName(m) {
  const names = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  return names[m]
}

function fmt(dateStr) {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

function getMonths(year, month, startDate, endDate) {
  const months = []
  let cur = new Date(startDate + 'T12:00:00')
  const end = new Date(endDate + 'T12:00:00')
  cur.setDate(1)
  while (cur <= end) {
    months.push({ year: cur.getFullYear(), month: cur.getMonth() })
    cur.setMonth(cur.getMonth() + 1)
  }
  return months
}

function buildGrid(year, month, startDate, endDate, entryDates, today) {
  const first = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startDow = first.getDay()
  const offset = startDow === 0 ? 6 : startDow - 1

  const cells = []
  for (let i = 0; i < offset; i++) {
    cells.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = apiDate(year, month, d)
    const inRange = ds >= startDate && ds <= endDate
    const isFuture = ds > today
    const done = inRange && entryDates.has(ds)
    cells.push({ day: d, date: ds, inRange, done, clickable: inRange, isToday: ds === today, isFuture })
  }
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export default function Tracking() {
  const [trackers, setTrackers] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const today = new Date()
  const todayStr = apiDate(today.getFullYear(), today.getMonth(), today.getDate())

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const data = await getTrackers()
      setTrackers(data)
      const s = {}
      for (const t of data) {
        s[t.id] = await getTrackerStats(t.id)
      }
      setStats(s)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function toggleDay(trackerId, dateStr) {
    try {
      await toggleTrackerEntry(trackerId, dateStr)
      await load()
    } catch (e) {
      console.error(e)
    }
  }

  function openCreate() {
    setEditingId(null)
    setForm({ name: '', description: '', start_date: todayStr, target_days: 30 })
    setModalOpen(true)
  }

  function openEdit(tracker) {
    setEditingId(tracker.id)
    setForm({
      name: tracker.name,
      description: tracker.description || '',
      start_date: tracker.start_date,
      target_days: tracker.target_days,
    })
    setModalOpen(true)
  }

  async function saveTracker() {
    if (!form.name.trim()) return
    try {
      if (editingId) {
        await updateTracker(editingId, form)
      } else {
        await createTracker(form)
      }
      setModalOpen(false)
      await load()
    } catch (e) {
      console.error(e)
    }
  }

  async function removeTracker(id) {
    try {
      await deleteTracker(id)
      await load()
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) return <div className="page"><p className="muted">Cargando...</p></div>

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Tracking</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ Nuevo tracker</button>
      </div>

      <div className="page">
        {trackers.length === 0 ? (
          <p className="muted">No hay trackers aún. Crea uno para empezar.</p>
        ) : (
          <div className="trackers-list">
            {trackers.map(t => {
              const entryDates = new Set((t.entries || []).map(e => e.date))
              const s = stats[t.id] || {}
              const endDate = (() => {
                const d = new Date(t.start_date + 'T12:00:00')
                d.setDate(d.getDate() + t.target_days - 1)
                return apiDate(d.getFullYear(), d.getMonth(), d.getDate())
              })()
              const months = getMonths(
                today.getFullYear(), today.getMonth(),
                t.start_date, endDate
              )


              const pct = s.target > 0 ? Math.round((s.done / s.target) * 100) : 0

              return (
                <div key={t.id} className="tracker-card">
                  <div className="tracker-header">
                    <div className="tracker-info">
                      <h3 className="tracker-name">{t.name}</h3>
                      {t.description && <span className="tracker-desc">{t.description}</span>}
                    </div>
                    <div className="tracker-actions">
                      <button className="btn btn-icon" onClick={() => openEdit(t)} title="Editar">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M10 1l3 3-8 8H2v-3z"/></svg>
                      </button>
                      <button className="btn btn-icon" onClick={() => removeTracker(t.id)} title="Eliminar">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="1 3 13 3 12 13 2 13 1 3"/><line x1="5" y1="1" x2="9" y2="1"/></svg>
                      </button>
                    </div>
                  </div>

                  <div className="tracker-meta">
                    Inicio: {fmt(t.start_date)} &middot; Meta: {t.target_days} días
                    &ensp;·&ensp;
                    <strong className="tracker-progress-text">✅ {s.done}/{s.target} ({pct}%)</strong>
                  </div>

                  <div className="tracker-progress-bar">
                    <div className="tracker-progress-fill" style={{ width: `${pct}%` }} />
                  </div>

                  <div className="tracker-months">
                    {months.map(m => {
                      const grid = buildGrid(
                        m.year, m.month,
                        t.start_date, endDate, entryDates, todayStr
                      )
                      return (
                        <div key={`${m.year}-${m.month}`} className="tracker-month">
                          <div className="tracker-month-title">
                            {monthName(m.month)} {m.year}
                          </div>
                          <div className="tracker-weekdays">
                            <span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span>
                          </div>
                          <div className="tracker-days-grid">
                            {grid.map((cell, i) =>
                              cell ? (
                                <button
                                  key={i}
                                  className={`tracker-cell${cell.done ? ' done' : ''}${cell.isToday ? ' today' : ''}${!cell.clickable ? ' dim' : ''}${cell.isFuture && !cell.done ? ' future' : ''}`}
                                  disabled={!cell.clickable}
                                  onClick={() => toggleDay(t.id, cell.date)}
                                  title={cell.date}
                                >
                                  {cell.day}
                                </button>
                              ) : (
                                <div key={i} className="tracker-cell empty" />
                              )
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="tracker-stats">
                    <span className="stat">🔥 Racha: <strong>{s.streak || 0}</strong> días</span>
                    <span className="stat">🏆 Mejor racha: <strong>{s.best_streak || 0}</strong> días</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar tracker' : 'Nuevo tracker'}>
        <div className="modal-form">
          <label className="field">
            <span>Nombre</span>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej: Desayunar" autoFocus />
          </label>
          <label className="field">
            <span>Descripción</span>
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Opcional" />
          </label>
          <label className="field">
            <span>Fecha de inicio</span>
            <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
          </label>
          <label className="field">
            <span>Días a tracking</span>
            <input type="number" min="1" value={form.target_days} onChange={e => setForm({ ...form, target_days: parseInt(e.target.value) || 1 })} />
          </label>
          <div className="modal-actions">
            <button className="btn btn-primary" onClick={saveTracker}>{editingId ? 'Guardar' : 'Crear'}</button>
            <button className="btn" onClick={() => setModalOpen(false)}>Cancelar</button>
          </div>
        </div>
      </Modal>
    </>
  )
}
