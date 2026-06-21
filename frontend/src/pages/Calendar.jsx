import { useState, useEffect, useCallback } from 'react'
import { getCalendarEvents, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from '../api'
import Modal from '../components/Modal'

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay() || 7
}

function toDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function todayStr() {
  const d = new Date()
  return toDateStr(d.getFullYear(), d.getMonth(), d.getDate())
}

const EMPTY_FORM = { title: '', description: '', date: '', start_time: '', end_time: '', all_day: false }

export default function Calendar() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const loadEvents = useCallback(async () => {
    try {
      const data = await getCalendarEvents(year, month + 1)
      setEvents(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  function prevMonth() {
    if (month === 0) {
      setYear(y => y - 1)
      setMonth(11)
    } else {
      setMonth(m => m - 1)
    }
  }

  function nextMonth() {
    if (month === 11) {
      setYear(y => y + 1)
      setMonth(0)
    } else {
      setMonth(m => m + 1)
    }
  }

  function openCreate(day) {
    setEditingId(null)
    setForm({ ...EMPTY_FORM, date: toDateStr(year, month, day) })
    setModalOpen(true)
  }

  function openEdit(event) {
    setEditingId(event.id)
    setForm({
      title: event.title,
      description: event.description || '',
      date: event.date,
      start_time: event.start_time || '',
      end_time: event.end_time || '',
      all_day: event.all_day,
    })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.title.trim() || !form.date) return
    try {
      const payload = {
        ...form,
        start_time: form.start_time || null,
        end_time: form.end_time || null,
      }
      if (editingId) {
        await updateCalendarEvent(editingId, payload)
      } else {
        await createCalendarEvent(payload)
      }
      setModalOpen(false)
      await loadEvents()
    } catch (e) {
      console.error(e)
    }
  }

  async function handleDelete(id) {
    try {
      await deleteCalendarEvent(id)
      setModalOpen(false)
      await loadEvents()
    } catch (e) {
      console.error(e)
    }
  }

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const today = todayStr()

  const cells = []
  for (let i = 0; i < firstDay - 1; i++) {
    cells.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d)
  }

  function getEventsForDay(day) {
    const dateStr = toDateStr(year, month, day)
    return events.filter(e => e.date === dateStr)
  }

  if (loading) return <div className="page"><p className="muted">Cargando...</p></div>

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Calendario</h2>
      </div>

      <div className="page">
        <div className="calendar-nav">
          <button className="btn btn-icon" onClick={prevMonth}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="10 3 5 8 10 13"/>
            </svg>
          </button>
          <span className="calendar-nav-title">{MONTHS[month]} {year}</span>
          <button className="btn btn-icon" onClick={nextMonth}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="6 3 11 8 6 13"/>
            </svg>
          </button>
        </div>

        <div className="calendar-grid">
          {DAY_LABELS.map(d => (
            <div key={d} className="calendar-day-label">{d}</div>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <div key={`e-${i}`} className="calendar-cell empty" />
            const dayEvents = getEventsForDay(day)
            const dateStr = toDateStr(year, month, day)
            const isToday = dateStr === today
            return (
              <div
                key={day}
                className={`calendar-cell${isToday ? ' today' : ''}`}
                onClick={() => openCreate(day)}
              >
                <span className="calendar-day-num">{day}</span>
                {dayEvents.length > 0 && (
                  <div className="calendar-events">
                    {dayEvents.map(ev => (
                      <div
                        key={ev.id}
                        className="calendar-event-pill"
                        onClick={(e) => { e.stopPropagation(); openEdit(ev) }}
                      >
                        {ev.all_day ? ev.title : `${ev.start_time || ''} ${ev.title}`}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar evento' : 'Nuevo evento'}
      >
        <div className="modal-form">
          <label className="field">
            <span>Título</span>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Título del evento" autoFocus />
          </label>

          <label className="field">
            <span>Descripción</span>
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Opcional" />
          </label>

          <label className="field">
            <span>Fecha</span>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          </label>

          <label className="field row">
            <span>Todo el día</span>
            <label className="toggle">
              <input type="checkbox" checked={form.all_day} onChange={e => setForm({ ...form, all_day: e.target.checked })} />
              <span className="toggle-track" />
            </label>
          </label>

          {!form.all_day && (
            <>
              <label className="field">
                <span>Hora inicio</span>
                <input type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} />
              </label>
              <label className="field">
                <span>Hora fin</span>
                <input type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} />
              </label>
            </>
          )}

          <div className="modal-actions">
            <button className="btn btn-primary" onClick={handleSave}>{editingId ? 'Guardar' : 'Crear'}</button>
            {editingId && (
              <button className="btn btn-danger" onClick={() => handleDelete(editingId)}>Eliminar</button>
            )}
            <button className="btn" onClick={() => setModalOpen(false)}>Cancelar</button>
          </div>
        </div>
      </Modal>
    </>
  )
}
