const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || res.statusText)
  }
  return res.status === 204 ? null : res.json()
}

export const getNotes = () => request('/notes')

export const createNote = (data) =>
  request('/notes', { method: 'POST', body: JSON.stringify(data) })

export const updateNote = (id, data) =>
  request(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const deleteNote = (id) =>
  request(`/notes/${id}`, { method: 'DELETE' })

// -- Reminders --

export const getReminders = () => request('/reminders')

export const createReminder = (data) =>
  request('/reminders', { method: 'POST', body: JSON.stringify(data) })

export const updateReminder = (id, data) =>
  request(`/reminders/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const deleteReminder = (id) =>
  request(`/reminders/${id}`, { method: 'DELETE' })

export const checkReminders = () => request('/reminders/check')

export const fireReminder = (id) =>
  request(`/reminders/${id}/fire`, { method: 'POST' })

// -- Calendar --

export const getCalendarEvents = (year, month) =>
  request(`/calendar?year=${year}&month=${month}`)

export const createCalendarEvent = (data) =>
  request('/calendar', { method: 'POST', body: JSON.stringify(data) })

export const updateCalendarEvent = (id, data) =>
  request(`/calendar/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const deleteCalendarEvent = (id) =>
  request(`/calendar/${id}`, { method: 'DELETE' })

// -- Topics --

export const getTopics = () => request('/topics')

export const createTopic = (data) =>
  request('/topics', { method: 'POST', body: JSON.stringify(data) })

export const updateTopic = (id, data) =>
  request(`/topics/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const deleteTopic = (id) =>
  request(`/topics/${id}`, { method: 'DELETE' })

// -- Todos --

export const getTodos = (topicId) =>
  request(topicId ? `/todos?topic_id=${topicId}` : '/todos')

export const createTodo = (data) =>
  request('/todos', { method: 'POST', body: JSON.stringify(data) })

export const updateTodo = (id, data) =>
  request(`/todos/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const deleteTodo = (id) =>
  request(`/todos/${id}`, { method: 'DELETE' })

// -- Routines --

export const getRoutines = () => request('/routines')

export const createRoutine = (data) =>
  request('/routines', { method: 'POST', body: JSON.stringify(data) })

export const updateRoutine = (id, data) =>
  request(`/routines/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const deleteRoutine = (id) =>
  request(`/routines/${id}`, { method: 'DELETE' })

// -- Sessions --

export const getSessions = (routineId) =>
  request(routineId ? `/sessions?routine_id=${routineId}` : '/sessions')

export const createSession = (data) =>
  request('/sessions', { method: 'POST', body: JSON.stringify(data) })

export const deleteSession = (id) =>
  request(`/sessions/${id}`, { method: 'DELETE' })

// -- Trackers --

export const getTrackers = () => request('/trackers')

export const createTracker = (data) =>
  request('/trackers', { method: 'POST', body: JSON.stringify(data) })

export const updateTracker = (id, data) =>
  request(`/trackers/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const deleteTracker = (id) =>
  request(`/trackers/${id}`, { method: 'DELETE' })

export const toggleTrackerEntry = (id, date) =>
  request(`/trackers/${id}/toggle`, { method: 'POST', body: JSON.stringify({ date }) })

export const getTrackerStats = (id) =>
  request(`/trackers/${id}/stats`)

// -- Chat --

export const chatListModels = (apiKey, baseUrl) =>
  request('/chat/models', {
    method: 'POST',
    body: JSON.stringify({ api_key: apiKey, base_url: baseUrl }),
  })

export const chatSend = (apiKey, baseUrl, model, messages) =>
  request('/chat/send', {
    method: 'POST',
    body: JSON.stringify({ api_key: apiKey, base_url: baseUrl, model, messages }),
  })
