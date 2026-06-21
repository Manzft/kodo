import { useState, useEffect } from 'react'
import { getTopics, createTopic, updateTopic, deleteTopic, getTodos, createTodo, updateTodo, deleteTodo } from '../api'
import Modal from '../components/Modal'
import { useLang } from '../i18n'

const TOPIC_COLORS = ['#f26c8f', '#f9a825', '#66bb6a', '#42a5f5', '#ab47bc', '#26c6da', '#ef5350', '#8d6e63']
const EMPTY_TOPIC = { name: '', color: TOPIC_COLORS[0] }
const EMPTY_TODO = { topic_id: null, title: '', description: '', due_date: '', priority: 'medium' }

export default function Todo() {
  const { t } = useLang()
  const [topics, setTopics] = useState([])
  const [items, setItems] = useState([])
  const [activeTopic, setActiveTopic] = useState(null)
  const [loading, setLoading] = useState(true)

  const [topicModal, setTopicModal] = useState(false)
  const [editingTopic, setEditingTopic] = useState(null)
  const [topicForm, setTopicForm] = useState(EMPTY_TOPIC)

  const [todoModal, setTodoModal] = useState(false)
  const [editingTodo, setEditingTodo] = useState(null)
  const [todoForm, setTodoForm] = useState(EMPTY_TODO)

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const [tpc, it] = await Promise.all([getTopics(), getTodos()])
      setTopics(tpc)
      setItems(it)
      if (tpc.length > 0 && !activeTopic) setActiveTopic(tpc[0].id)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = activeTopic ? items.filter(i => i.topic_id === activeTopic) : items
  const currentTopic = topics.find(t => t.id === activeTopic)
  const priorityLabels = t('todo.priorities')

  function openTopicCreate() {
    setEditingTopic(null)
    setTopicForm({ ...EMPTY_TOPIC, color: TOPIC_COLORS[0] })
    setTopicModal(true)
  }

  function openTopicEdit(topic) {
    setEditingTopic(topic.id)
    setTopicForm({ name: topic.name, color: topic.color })
    setTopicModal(true)
  }

  async function saveTopic() {
    if (!topicForm.name.trim()) return
    try {
      if (editingTopic) { await updateTopic(editingTopic, topicForm) }
      else { await createTopic(topicForm) }
      setTopicModal(false)
      await load()
    } catch (e) { console.error(e) }
  }

  async function removeTopic(id, e) {
    e.stopPropagation()
    try {
      await deleteTopic(id)
      if (activeTopic === id) setActiveTopic(topics.length > 1 ? topics.find(t => t.id !== id)?.id : null)
      await load()
    } catch (e) { console.error(e) }
  }

  function openTodoCreate() {
    setEditingTodo(null)
    setTodoForm({ ...EMPTY_TODO, topic_id: activeTopic })
    setTodoModal(true)
  }

  function openTodoEdit(item) {
    setEditingTodo(item.id)
    setTodoForm({
      topic_id: item.topic_id, title: item.title,
      description: item.description || '', due_date: item.due_date || '',
      priority: item.priority || 'medium',
    })
    setTodoModal(true)
  }

  async function saveTodo() {
    if (!todoForm.title.trim() || !todoForm.topic_id) return
    try {
      const payload = { ...todoForm, due_date: todoForm.due_date || null }
      if (editingTodo) { await updateTodo(editingTodo, payload) }
      else { await createTodo(payload) }
      setTodoModal(false)
      await load()
    } catch (e) { console.error(e) }
  }

  async function toggleDone(item) {
    try {
      await updateTodo(item.id, { done: !item.done })
      await load()
    } catch (e) { console.error(e) }
  }

  async function removeTodo(id) {
    try {
      await deleteTodo(id)
      setTodoModal(false)
      await load()
    } catch (e) { console.error(e) }
  }

  if (loading) return <div className="page"><p className="muted">{t('common.loading')}</p></div>

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">{t('todo.title')}</h2>
        <div className="page-header-actions">
          <button className="btn" onClick={openTopicCreate}>{t('todo.newTopic')}</button>
          <button className="btn btn-primary" onClick={openTodoCreate}>{t('todo.newTask')}</button>
        </div>
      </div>

      <div className="page">
        {topics.length === 0 ? (
          <p className="muted">{t('todo.empty')}</p>
        ) : (
          <>
            <div className="topic-bar">
              {topics.map(t => (
                <button
                  key={t.id}
                  className={`topic-chip${activeTopic === t.id ? ' active' : ''}`}
                  onClick={() => setActiveTopic(t.id)}
                  onContextMenu={(e) => { e.preventDefault(); openTopicEdit(t) }}
                >
                  <span className="topic-dot" style={{ background: t.color }} />
                  {t.name}
                </button>
              ))}
            </div>

            <div className="todo-section-header">
              <span className="todo-section-title">{currentTopic?.name || 'Todas'} · {filteredItems.length}</span>
            </div>

            {filteredItems.length === 0 ? (
              <p className="muted">{t('todo.emptyTopic')}</p>
            ) : (
              <div className="todo-list">
                {filteredItems.map(item => (
                  <div key={item.id} className={`todo-item${item.done ? ' done' : ''}`}>
                    <label className="todo-check" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={item.done} onChange={() => toggleDone(item)} />
                      <span className="todo-checkmark" />
                    </label>
                    <div className="todo-body" onClick={() => openTodoEdit(item)}>
                      <div className="todo-title">{item.title}</div>
                      {item.description && <div className="todo-desc">{item.description}</div>}
                      <div className="todo-meta">
                        <span className={`priority-badge ${item.priority}`}>{priorityLabels[item.priority]}</span>
                        {item.due_date && <span className="todo-due">{item.due_date}</span>}
                      </div>
                    </div>
                    <div className="todo-actions">
                      <button className="btn btn-icon" onClick={() => openTodoEdit(item)} title={t('common.edit')}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M10 1l3 3-8 8H2v-3z"/></svg>
                      </button>
                      <button className="btn btn-icon" onClick={() => removeTodo(item.id)} title={t('common.delete')}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="1 3 13 3 12 13 2 13 1 3"/><line x1="5" y1="1" x2="9" y2="1"/></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Modal open={topicModal} onClose={() => setTopicModal(false)} title={editingTopic ? t('todo.editTopic') : t('todo.createTopic')}>
        <div className="modal-form">
          <label className="field">
            <span>{t('todo.topicName')}</span>
            <input value={topicForm.name} onChange={e => setTopicForm({ ...topicForm, name: e.target.value })} placeholder={t('todo.topicNamePlaceholder')} autoFocus />
          </label>
          <div className="field">
            <span>{t('common.color')}</span>
            <div className="color-picker">
              {TOPIC_COLORS.map(c => (
                <button key={c} className={`color-swatch${topicForm.color === c ? ' active' : ''}`} style={{ background: c }} onClick={() => setTopicForm({ ...topicForm, color: c })} />
              ))}
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-primary" onClick={saveTopic}>{editingTopic ? t('common.save') : t('common.create')}</button>
            {editingTopic && <button className="btn btn-danger" onClick={(e) => { setTopicModal(false); removeTopic(editingTopic, e) }}>{t('common.delete')}</button>}
            <button className="btn" onClick={() => setTopicModal(false)}>{t('common.cancel')}</button>
          </div>
        </div>
      </Modal>

      <Modal open={todoModal} onClose={() => setTodoModal(false)} title={editingTodo ? t('todo.editTask') : t('todo.createTask')}>
        <div className="modal-form">
          <label className="field">
            <span>{t('common.title')}</span>
            <input value={todoForm.title} onChange={e => setTodoForm({ ...todoForm, title: e.target.value })} placeholder={t('todo.taskTitlePlaceholder')} autoFocus />
          </label>
          <label className="field">
            <span>{t('common.description')}</span>
            <input value={todoForm.description} onChange={e => setTodoForm({ ...todoForm, description: e.target.value })} placeholder={t('todo.descriptionPlaceholder')} />
          </label>
          <label className="field">
            <span>{t('todo.priority')}</span>
            <select className="field-select" value={todoForm.priority} onChange={e => setTodoForm({ ...todoForm, priority: e.target.value })}>
              <option value="low">{priorityLabels.low}</option>
              <option value="medium">{priorityLabels.medium}</option>
              <option value="high">{priorityLabels.high}</option>
            </select>
          </label>
          <label className="field">
            <span>{t('todo.dueDate')}</span>
            <input type="date" value={todoForm.due_date} onChange={e => setTodoForm({ ...todoForm, due_date: e.target.value })} />
          </label>
          <div className="modal-actions">
            <button className="btn btn-primary" onClick={saveTodo}>{editingTodo ? t('common.save') : t('common.create')}</button>
            {editingTodo && <button className="btn btn-danger" onClick={() => removeTodo(editingTodo)}>{t('common.delete')}</button>}
            <button className="btn" onClick={() => setTodoModal(false)}>{t('common.cancel')}</button>
          </div>
        </div>
      </Modal>
    </>
  )
}
