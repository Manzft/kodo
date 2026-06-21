import { useState, useEffect, useCallback } from 'react'
import { getRoutines, createRoutine, updateRoutine, deleteRoutine, getSessions, createSession, deleteSession } from '../api'
import Modal from '../components/Modal'
import { useLang } from '../i18n'

const EMPTY_ROUTINE = { name: '', exercises: [] }
const EMPTY_EXERCISE = { name: '', sets: 3, reps: 10 }

export default function Routine() {
  const { t } = useLang()
  const [routines, setRoutines] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('routines')

  const [routineModal, setRoutineModal] = useState(false)
  const [editingRoutine, setEditingRoutine] = useState(null)
  const [routineForm, setRoutineForm] = useState(EMPTY_ROUTINE)

  const [sessionModal, setSessionModal] = useState(false)
  const [sessionRoutine, setSessionRoutine] = useState(null)
  const [sessionForm, setSessionForm] = useState(null)

  const load = useCallback(async () => {
    try {
      const [r, s] = await Promise.all([getRoutines(), getSessions()])
      setRoutines(r)
      setSessions(s)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function openRoutineCreate() {
    setEditingRoutine(null)
    setRoutineForm({ ...EMPTY_ROUTINE, exercises: [] })
    setRoutineModal(true)
  }

  function openRoutineEdit(r) {
    setEditingRoutine(r.id)
    setRoutineForm({ name: r.name, exercises: r.exercises.map(e => ({ ...e })) })
    setRoutineModal(true)
  }

  function addExercise() {
    setRoutineForm(f => ({ ...f, exercises: [...f.exercises, { ...EMPTY_EXERCISE }] }))
  }

  function removeExercise(i) {
    setRoutineForm(f => ({ ...f, exercises: f.exercises.filter((_, idx) => idx !== i) }))
  }

  function updateExercise(i, field, value) {
    setRoutineForm(f => {
      const ex = [...f.exercises]
      ex[i] = { ...ex[i], [field]: value }
      return { ...f, exercises: ex }
    })
  }

  async function saveRoutine() {
    if (!routineForm.name.trim()) return
    try {
      if (editingRoutine) { await updateRoutine(editingRoutine, routineForm) }
      else { await createRoutine(routineForm) }
      setRoutineModal(false)
      await load()
    } catch (e) { console.error(e) }
  }

  async function removeRoutine(id) {
    try { await deleteRoutine(id); await load() }
    catch (e) { console.error(e) }
  }

  async function removeSession(id) {
    try { await deleteSession(id); await load() }
    catch (e) { console.error(e) }
  }

  function openSession(routine) {
    setSessionRoutine(routine)
    const exercises = routine.exercises.map(e => ({
      name: e.name,
      sets: Array.from({ length: e.sets }, () => ({ reps: e.reps })),
    }))
    setSessionForm({
      routine_id: routine.id, routine_name: routine.name,
      date: new Date().toISOString().slice(0, 10),
      duration: '', notes: '', exercises,
    })
    setSessionModal(true)
  }

  function updateSessionSet(exIdx, setIdx, field, value) {
    setSessionForm(f => {
      const ex = [...f.exercises]
      const sets = [...ex[exIdx].sets]
      sets[setIdx] = { ...sets[setIdx], [field]: Number(value) }
      ex[exIdx] = { ...ex[exIdx], sets }
      return { ...f, exercises: ex }
    })
  }

  async function saveSession() {
    if (!sessionForm.date) return
    try {
      await createSession({ ...sessionForm, duration: sessionForm.duration ? Number(sessionForm.duration) : null })
      setSessionModal(false)
      await load()
    } catch (e) { console.error(e) }
  }

  if (loading) return <div className="page"><p className="muted">{t('common.loading')}</p></div>

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">{t('routine.title')}</h2>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openRoutineCreate}>{t('routine.newRoutine')}</button>
        </div>
      </div>

      <div className="page">
        <div className="tab-bar">
          <button className={`tab-btn${tab === 'routines' ? ' active' : ''}`} onClick={() => setTab('routines')}>{t('routine.tabRoutines')}</button>
          <button className={`tab-btn${tab === 'history' ? ' active' : ''}`} onClick={() => setTab('history')}>{t('routine.tabHistory')}</button>
        </div>

        {tab === 'routines' && (
          routines.length === 0 ? (
            <p className="muted">{t('routine.empty')}</p>
          ) : (
            <div className="routines-list">
              {routines.map(r => (
                <div key={r.id} className="routine-card">
                  <div className="routine-header">
                    <h3 className="routine-name">{r.name}</h3>
                    <div className="routine-actions">
                      <button className="btn btn-primary btn-sm" onClick={() => openSession(r)}>{t('routine.newSession')}</button>
                      <button className="btn btn-icon" onClick={() => openRoutineEdit(r)} title={t('common.edit')}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M10 1l3 3-8 8H2v-3z"/></svg>
                      </button>
                      <button className="btn btn-icon" onClick={() => removeRoutine(r.id)} title={t('common.delete')}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="1 3 13 3 12 13 2 13 1 3"/><line x1="5" y1="1" x2="9" y2="1"/></svg>
                      </button>
                    </div>
                  </div>
                  <div className="routine-exercises">
                    {r.exercises.map((e, i) => (
                      <div key={i} className="exercise-chip">{e.name} · {e.sets}×{e.reps}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {tab === 'history' && (
          sessions.length === 0 ? (
            <p className="muted">{t('routine.emptySession')}</p>
          ) : (
            <div className="sessions-list">
              {sessions.map(s => (
                <div key={s.id} className="session-card">
                  <div className="session-main">
                    <span className="session-date">{s.date}</span>
                    <span className="session-routine">{s.routine_name}</span>
                    {s.duration && <span className="session-duration">{s.duration} {t('common.min')}</span>}
                    <button className="btn btn-icon" onClick={() => removeSession(s.id)} title={t('routine.deleteSessionTitle')}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="1 3 13 3 12 13 2 13 1 3"/><line x1="5" y1="1" x2="9" y2="1"/></svg>
                    </button>
                  </div>
                  <div className="session-exercises">
                    {s.exercises.map((e, i) => (
                      <div key={i} className="session-exercise">
                        <span className="se-name">{e.name}</span>
                        <span className="se-sets">{e.sets.map((set, j) => (
                          <span key={j} className="se-set">{set.reps} {t('common.reps')}</span>
                        ))}</span>
                      </div>
                    ))}
                  </div>
                  {s.notes && <div className="session-notes">{s.notes}</div>}
                </div>
              ))}
            </div>
          )
        )}
      </div>

      <Modal open={routineModal} onClose={() => setRoutineModal(false)} title={editingRoutine ? t('routine.editRoutine') : t('routine.createRoutine')}>
        <div className="modal-form">
          <label className="field">
            <span>{t('common.name')}</span>
            <input value={routineForm.name} onChange={e => setRoutineForm({ ...routineForm, name: e.target.value })} placeholder={t('routine.namePlaceholder')} autoFocus />
          </label>
          <div className="field">
            <span>{t('routine.exercises')}</span>
            <div className="exercise-list">
              {routineForm.exercises.map((ex, i) => (
                <div key={i} className="exercise-row">
                  <div className="exercise-fields">
                    <input value={ex.name} onChange={e => updateExercise(i, 'name', e.target.value)} placeholder={t('routine.exercisePlaceholder')} />
                    <input type="number" value={ex.sets} onChange={e => updateExercise(i, 'sets', Number(e.target.value))} min="1" className="num-input" title={t('common.series')} />
                    <span className="ex-label">×</span>
                    <input type="number" value={ex.reps} onChange={e => updateExercise(i, 'reps', Number(e.target.value))} min="1" className="num-input" title={t('common.reps')} />
                    <span className="ex-label">{t('common.reps')}</span>
                  </div>
                  <button className="btn btn-icon" onClick={() => removeExercise(i)} title={t('common.delete')}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="1" y1="1" x2="11" y2="11"/><line x1="11" y1="1" x2="1" y2="11"/></svg>
                  </button>
                </div>
              ))}
            </div>
            <button className="btn btn-sm" onClick={addExercise} style={{ marginTop: '0.5rem' }}>{t('routine.addExercise')}</button>
          </div>
          <div className="modal-actions">
            <button className="btn btn-primary" onClick={saveRoutine}>{editingRoutine ? t('common.save') : t('common.create')}</button>
            <button className="btn" onClick={() => setRoutineModal(false)}>{t('common.cancel')}</button>
          </div>
        </div>
      </Modal>

      <Modal open={sessionModal} onClose={() => setSessionModal(false)} title={`${t('routine.sessionFor')} ${sessionRoutine?.name || ''}`}>
        {sessionForm && (
          <div className="modal-form">
            <label className="field">
              <span>{t('routine.sessionDate')}</span>
              <input type="date" value={sessionForm.date} onChange={e => setSessionForm({ ...sessionForm, date: e.target.value })} />
            </label>
            <label className="field">
              <span>{t('routine.sessionDuration')}</span>
              <input type="number" value={sessionForm.duration} onChange={e => setSessionForm({ ...sessionForm, duration: e.target.value })} placeholder={t('routine.sessionDurationPlaceholder')} min="0" />
            </label>
            <div className="field">
              <span>{t('routine.sessionExercises')}</span>
              <p className="field-hint">{t('routine.sessionHint')}</p>
              {sessionForm.exercises.map((ex, i) => (
                <div key={i} className="session-exercise-form">
                  <div className="se-form-name">{ex.name}</div>
                  {ex.sets.map((set, j) => (
                    <div key={j} className="se-form-set">
                      <span className="se-set-label">{j + 1}.</span>
                      <input type="number" value={set.reps} onChange={e => updateSessionSet(i, j, 'reps', e.target.value)} min="0" className="num-input" title={t('common.reps')} />
                      <span className="ex-label">{t('common.reps')}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <label className="field">
              <span>{t('routine.sessionNotes')}</span>
              <input value={sessionForm.notes} onChange={e => setSessionForm({ ...sessionForm, notes: e.target.value })} placeholder={t('routine.sessionNotesPlaceholder')} />
            </label>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={saveSession}>{t('routine.saveSession')}</button>
              <button className="btn" onClick={() => setSessionModal(false)}>{t('common.cancel')}</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
