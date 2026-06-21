import { useState, useEffect } from 'react'
import { getNotes, createNote, updateNote, deleteNote } from '../api'
import Modal from '../components/Modal'
import { useLang } from '../i18n'

const EMPTY_FORM = { title: '', content: '' }

export default function Notes() {
  const { t } = useLang()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => { loadNotes() }, [])

  async function loadNotes() {
    try {
      const data = await getNotes()
      setNotes(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditingId(null)
    setForm({ ...EMPTY_FORM })
    setModalOpen(true)
  }

  function openEdit(note) {
    setEditingId(note.id)
    setForm({ title: note.title, content: note.content })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.title.trim()) return
    try {
      if (editingId) {
        await updateNote(editingId, form)
      } else {
        await createNote(form)
      }
      setModalOpen(false)
      await loadNotes()
    } catch (e) {
      console.error(e)
    }
  }

  async function handleDelete(id, e) {
    e.stopPropagation()
    try {
      await deleteNote(id)
      await loadNotes()
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) return <div className="page"><p className="muted">{t('common.loading')}</p></div>

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">{t('notes.title')}</h2>
        <button className="btn btn-primary" onClick={openCreate}>
          {t('notes.new')}
        </button>
      </div>

      <div className="page">
        {notes.length === 0 ? (
          <p className="muted">{t('notes.empty')}</p>
        ) : (
          <div className="notes-grid">
            {notes.map((note) => (
              <div key={note.id} className="note-card">
                <div className="note-card-body" onClick={() => openEdit(note)}>
                  <h3 className="note-title">{note.title}</h3>
                  <p className="note-preview">
                    {note.content ? note.content.substring(0, 120) : t('common.noContent')}
                  </p>
                  <span className="note-date">
                    {new Date(note.updated_at).toLocaleDateString('es-ES', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="note-card-actions">
                  <button className="btn btn-icon" onClick={() => openEdit(note)} title={t('common.edit')}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M10 1l3 3-8 8H2v-3z"/>
                    </svg>
                  </button>
                  <button className="btn btn-icon" onClick={(e) => handleDelete(note.id, e)} title={t('common.delete')}>
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

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? t('notes.edit') : t('notes.create')}
      >
        <div className="modal-form">
          <label className="field">
            <span>{t('common.title')}</span>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={t('notes.titlePlaceholder')}
              autoFocus
            />
          </label>

          <label className="field">
            <span>{t('common.content')}</span>
            <textarea
              className="modal-textarea"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder={t('notes.contentPlaceholder')}
              rows={8}
            />
          </label>

          <div className="modal-actions">
            <button className="btn btn-primary" onClick={handleSave}>
              {editingId ? t('common.save') : t('common.create')}
            </button>
            <button className="btn" onClick={() => setModalOpen(false)}>{t('common.cancel')}</button>
          </div>
        </div>
      </Modal>
    </>
  )
}
