import { useState, useEffect } from 'react'
import { getReminders, createReminder, updateReminder, deleteReminder, checkReminders, fireReminder } from '../api'
import Modal from '../components/Modal'

const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

const EMPTY_FORM = {
  title: '',
  description: '',
  time: '12:00',
  days: [0, 1, 2, 3, 4, 5, 6],
  active: true,
  one_shot: false,
}

function formatDays(days) {
  if (!days || days.length === 0) return 'Nunca'
  if (days.length === 7) return 'Todos los días'
  if (days.length === 5 && [0, 1, 2, 3, 4].every((d) => days.includes(d)) && !days.includes(5) && !days.includes(6)) return 'Lun–Vie'
  if (JSON.stringify([...days].sort()) === JSON.stringify([5, 6])) return 'Fines de semana'
  return days.map((d) => DAY_LABELS[d]).join(' ')
}

export default function Reminders() {
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    loadReminders()
    const interval = setInterval(pollReminders, 10000)
    return () => clearInterval(interval)
  }, [])

  async function loadReminders() {
    try {
      const data = await getReminders()
      setReminders(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function pollReminders() {
    try {
      const due = await checkReminders()
      for (const r of due) {
        showToast(`⏰ ${r.title}`)
        await fireReminder(r.id)
        loadReminders()
      }
    } catch (e) {
      /* silent */
    }
  }

  function showToast(message) {
    setToast(message)
    setTimeout(() => setToast(null), 4000)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Kodo — Recordatorio', { body: message })
    }
  }

  function openCreate() {
    setEditing(null)
    setForm({ ...EMPTY_FORM, days: [...EMPTY_FORM.days] })
    setModalOpen(true)
  }

  function openEdit(r) {
    setEditing(r.id)
    setForm({
      title: r.title,
      description: r.description || '',
      time: r.time,
      days: [...r.days],
      active: r.active,
      one_shot: r.one_shot,
    })
    setModalOpen(true)
  }

  function toggleDay(d) {
    setForm((f) => ({
      ...f,
      days: f.days.includes(d) ? f.days.filter((x) => x !== d) : [...f.days, d].sort(),
    }))
  }

  async function handleSave() {
    if (!form.title.trim()) return
    try {
      if (editing) {
        await updateReminder(editing, form)
      } else {
        await createReminder(form)
      }
      setModalOpen(false)
      await loadReminders()
    } catch (e) {
      showToast('Error al guardar el recordatorio')
      console.error(e)
    }
  }

  async function handleDelete(id) {
    try {
      await deleteReminder(id)
      loadReminders()
    } catch (e) {
      console.error(e)
    }
  }

  async function toggleActive(r) {
    try {
      await updateReminder(r.id, { active: !r.active })
      loadReminders()
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) return <div className="page"><p className="muted">Cargando...</p></div>

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Recordatorios</h2>
        <button className="btn btn-primary" onClick={openCreate}>
          + Nuevo recordatorio
        </button>
      </div>

      <div className="page">
        {!('Notification' in window) || Notification.permission === 'default' ? (
          <p className="muted notice">
            <button className="btn btn-sm" onClick={() => Notification.requestPermission()}>
              Activar notificaciones de escritorio
            </button>
          </p>
        ) : null}

        {reminders.length === 0 ? (
          <p className="muted">No hay recordatorios aún.</p>
        ) : (
          <div className="reminders-list">
            {reminders.map((r) => (
              <div key={r.id} className={`reminder-card${!r.active ? ' inactive' : ''}`}>
                <div className="reminder-time">{r.time}</div>
                <div className="reminder-body">
                  <div className="reminder-title">{r.title}</div>
                  <div className="reminder-days">{formatDays(r.days)}</div>
                  {r.description && <div className="reminder-desc">{r.description}</div>}
                  {r.one_shot && <span className="badge">Única</span>}
                </div>
                <div className="reminder-actions">
                  <label className="toggle">
                    <input type="checkbox" checked={r.active} onChange={() => toggleActive(r)} />
                    <span className="toggle-track" />
                  </label>
                  <button className="btn btn-icon" onClick={() => openEdit(r)} title="Editar">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M10 1l3 3-8 8H2v-3z"/>
                    </svg>
                  </button>
                  <button className="btn btn-icon" onClick={() => handleDelete(r.id)} title="Eliminar">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <polyline points="1 3 13 3 12 13 2 13 1 3"/>
                      <line x1="5" y1="1" x2="9" y2="1"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar recordatorio' : 'Nuevo recordatorio'}>
        <div className="modal-form">
          <label className="field">
            <span>Título</span>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ej: Tomar agua" autoFocus />
          </label>

          <label className="field">
            <span>Descripción</span>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Opcional" />
          </label>

          <label className="field">
            <span>Hora</span>
            <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          </label>

          <div className="field">
            <span>Días</span>
            <div className="day-picker">
              {DAY_LABELS.map((l, i) => (
                <button
                  key={i}
                  className={`day-btn${form.days.includes(i) ? ' active' : ''}`}
                  onClick={() => toggleDay(i)}
                  title={DAY_NAMES[i]}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <label className="field row">
            <span>Una sola vez</span>
            <label className="toggle">
              <input type="checkbox" checked={form.one_shot} onChange={(e) => setForm({ ...form, one_shot: e.target.checked })} />
              <span className="toggle-track" />
            </label>
          </label>

          <div className="modal-actions">
            <button className="btn btn-primary" onClick={handleSave}>{editing ? 'Guardar' : 'Crear'}</button>
            <button className="btn" onClick={() => setModalOpen(false)}>Cancelar</button>
          </div>
        </div>
      </Modal>

      {toast && <div className="toast">{toast}</div>}
    </>
  )
}
