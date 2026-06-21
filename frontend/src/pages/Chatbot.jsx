import { useState, useRef, useEffect, useCallback } from 'react'
import { useLang } from '../i18n'
import { chatListModels, chatSend } from '../api'
import { Settings } from '../components/Icons'
import {
  getNotes,
  getReminders,
  getCalendarEvents,
  getTopics,
  getTodos,
  getRoutines,
  getSessions,
  getTrackers,
} from '../api'

function renderMarkdown(text) {
  const html = text
    .replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}

const PROVIDERS = [
  { label: 'OpenAI (ChatGPT)', url: 'https://api.openai.com/v1' },
  { label: 'Google Gemini', url: 'https://generativelanguage.googleapis.com/v1beta/openai/' },
  { label: 'DeepSeek', url: 'https://api.deepseek.com/v1' },
  { label: 'Mistral', url: 'https://api.mistral.ai/v1' },
  { label: 'Groq', url: 'https://api.groq.com/openai/v1' },
  { label: 'OpenRouter', url: 'https://openrouter.ai/api/v1' },
  { label: 'Together AI', url: 'https://api.together.xyz/v1' },
]

const CONTEXTS = ['general', 'notes', 'reminders', 'calendar', 'todo', 'routine', 'tracking']

async function fetchContextData(ctx) {
  const today = new Date()
  switch (ctx) {
    case 'notes': {
      const notes = await getNotes()
      if (!notes.length) return 'No hay notas.'
      return 'Notas:\n' + notes.map((n) => `- ${n.title || 'Sin título'}: ${(n.content || '').slice(0, 200)}`).join('\n')
    }
    case 'reminders': {
      const rems = await getReminders()
      if (!rems.length) return 'No hay recordatorios.'
      return 'Recordatorios:\n' + rems.map((r) => `- ${r.title} a las ${r.time} [${r.active ? 'activo' : 'inactivo'}]`).join('\n')
    }
    case 'calendar': {
      const events = await getCalendarEvents(today.getFullYear(), today.getMonth() + 1)
      if (!events.length) return 'No hay eventos este mes.'
      return `Eventos de ${today.toLocaleString('es', { month: 'long', year: 'numeric' })}:\n` +
        events.map((e) => `- ${e.title} el ${e.date}${e.all_day ? '' : ' de ' + (e.start_time || '') + ' a ' + (e.end_time || '')}`).join('\n')
    }
    case 'todo': {
      const [topics, todos] = await Promise.all([getTopics(), getTodos()])
      if (!topics.length && !todos.length) return 'No hay tareas.'
      let out = 'Temas:\n'
      for (const t of topics) {
        const items = todos.filter((d) => d.topic_id === t.id)
        out += `- ${t.name} (${items.filter((i) => i.done).length}/${items.length}):\n`
        for (const item of items) {
          out += `  ${item.done ? '✓' : '○'} ${item.title}${item.priority ? ' [' + item.priority + ']' : ''}\n`
        }
      }
      const untopiced = todos.filter((d) => !d.topic_id)
      if (untopiced.length) {
        out += `- Sin tema:\n`
        for (const item of untopiced) {
          out += `  ${item.done ? '✓' : '○'} ${item.title}${item.priority ? ' [' + item.priority + ']' : ''}\n`
        }
      }
      return out
    }
    case 'routine': {
      const [routines, sessions] = await Promise.all([getRoutines(), getSessions()])
      if (!routines.length && !sessions.length) return 'No hay rutinas.'
      let out = 'Rutinas:\n'
      for (const r of routines) {
        out += `- ${r.name}: ${r.exercises.map((e) => `${e.name} ${e.sets}x${e.reps}`).join(', ')}\n`
      }
      if (sessions.length) {
        out += `\nHistorial de sesiones (últimas 10):\n`
        sessions.slice(-10).reverse().forEach((s) => {
          out += `- ${s.date}: ${s.duration || '?'}min — ${s.routine_name || '?'}\n`
        })
      }
      return out
    }
    case 'tracking': {
      const trackers = await getTrackers()
      if (!trackers.length) return 'No hay trackers.'
      return 'Trackers:\n' + trackers.map((tr) => {
        const done = (tr.dates || []).length
        return `- ${tr.name}: ${done}/${tr.target_days || '∞'} días completados, racha actual: ${tr.streak || 0}`
      }).join('\n')
    }
    default:
      return ''
  }
}

export default function Chatbot() {
  const { t, lang } = useLang()
  const fromStorage = (k, def) => {
    try { return localStorage.getItem(k) || def } catch { return def }
  }
  const [apiKey, setApiKey] = useState(() => fromStorage('kodo-chat-api-key', ''))
  const [baseUrl, setBaseUrl] = useState(() => fromStorage('kodo-chat-base-url', PROVIDERS[0].url))
  const [providerLabel, setProviderLabel] = useState(() => {
    const saved = fromStorage('kodo-chat-base-url', PROVIDERS[0].url)
    return PROVIDERS.find((p) => p.url === saved)?.label || ''
  })
  const [model, setModel] = useState(() => fromStorage('kodo-chat-model', ''))
  const [models, setModels] = useState([])
  const [messages, setMessages] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kodo-chat-messages') || '[]') } catch { return [] }
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingModels, setFetchingModels] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [modelError, setModelError] = useState('')
  const [activeCtx, setActiveCtx] = useState(fromStorage('kodo-chat-context', 'general'))
  const [ctxData, setCtxData] = useState('')
  const [ctxLoading, setCtxLoading] = useState(false)
  const [ctxLabel, setCtxLabel] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => { localStorage.setItem('kodo-chat-messages', JSON.stringify(messages)) }, [messages])
  useEffect(() => { localStorage.setItem('kodo-chat-context', activeCtx) }, [activeCtx])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  useEffect(() => {
    loadContext(activeCtx)
  }, [activeCtx])

  const saveApiKey = (key) => { setApiKey(key); localStorage.setItem('kodo-chat-api-key', key) }
  const saveBaseUrl = (url) => { setBaseUrl(url); localStorage.setItem('kodo-chat-base-url', url) }
  const saveModel = (m) => { setModel(m); localStorage.setItem('kodo-chat-model', m) }

  const selectProvider = (label) => {
    const p = PROVIDERS.find((prov) => prov.label === label)
    if (!p) return
    setProviderLabel(p.label)
    saveBaseUrl(p.url)
    setModel('')
    setModels([])
    setModelError('')
    if (apiKey) {
      setFetchingModels(true)
      chatListModels(apiKey, p.url)
        .then((res) => { setModels(res.models || []); if (!res.models?.length) setModelError(t('chatbot.noModels')) })
        .catch((e) => setModelError(e.message))
        .finally(() => setFetchingModels(false))
    }
  }

  const handleFetchModels = async () => {
    if (!apiKey) return
    setFetchingModels(true)
    setModelError('')
    try {
      const res = await chatListModels(apiKey, baseUrl)
      setModels(res.models || [])
      if (res.models?.length === 0) setModelError(t('chatbot.noModels'))
    } catch (e) {
      setModelError(e.message)
    }
    setFetchingModels(false)
  }

  const loadContext = useCallback(async (ctx) => {
    if (ctx === 'general') { setCtxData(''); setCtxLabel(''); return }
    setCtxLoading(true)
    try {
      const data = await fetchContextData(ctx)
      setCtxData(data)
      const lineCount = data.split('\n').filter((l) => l.startsWith('- ')).length
      setCtxLabel(ctx === 'general' ? '' : `${lineCount} items`)
    } catch {
      setCtxData(t('chatbot.ctxError'))
      setCtxLabel('error')
    }
    setCtxLoading(false)
  }, [t])

  const handleSend = async () => {
    if (!input.trim() || !model || !apiKey) return
    const userMsg = { role: 'user', content: input.trim() }
    const contextMsg = ctxData ? { role: 'system', content: `${t('chatbot.ctxSystem')}\n\n${ctxData}` } : null
    const fullMessages = contextMsg ? [contextMsg, ...messages, userMsg] : [...messages, userMsg]
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await chatSend(apiKey, baseUrl, model, fullMessages)
      setMessages((prev) => [...prev, res.message])
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `**${t('chatbot.error')}** ${e.message}` }])
    }
    setLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const clearChat = () => setMessages([])

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">{t('chatbot.title')}</h1>
        <div className="page-header-actions">
          {messages.length > 0 && (
            <button className="btn btn-sm" onClick={clearChat}>{t('common.delete')}</button>
          )}
          <button className="btn btn-sm" onClick={() => setShowSettings(true)}>
            <Settings /> {t('chatbot.settings')}
          </button>
        </div>
      </div>

      {!model ? (
        <div className="chat-welcome">
          <p>{t('chatbot.configureFirst')}</p>
          <button className="btn btn-primary" onClick={() => setShowSettings(true)}>
            {t('chatbot.settings')}
          </button>
        </div>
      ) : (
        <div className="chat-container">
          <div className="chat-context-bar">
            {CONTEXTS.map((ctx) => (
              <button
                key={ctx}
                className={`chat-ctx-btn${activeCtx === ctx ? ' active' : ''}`}
                onClick={() => setActiveCtx(ctx)}
              >
                {t(`chatbot.ctx_${ctx}`)}
                {ctx !== 'general' && activeCtx === ctx && ctxLabel && (
                  <span className="chat-ctx-badge">{ctxLabel}</span>
                )}
              </button>
            ))}
            {activeCtx !== 'general' && (
              <button className="btn-icon chat-ctx-reload" onClick={() => loadContext(activeCtx)} title="Recargar">
                ↻
              </button>
            )}
          </div>
          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="chat-empty">{t('chatbot.inputPlaceholder')}</div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg chat-msg-${msg.role}`}>
                <div className="chat-msg-content">{renderMarkdown(msg.content)}</div>
              </div>
            ))}
            {loading && <div className="chat-msg chat-msg-assistant"><div className="chat-msg-content chat-thinking">{t('chatbot.thinking')}</div></div>}
            <div ref={bottomRef} />
          </div>
          <div className="chat-input-bar">
            <textarea
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('chatbot.inputPlaceholder')}
              rows={1}
            />
            <button className="btn btn-primary" onClick={handleSend} disabled={loading || !input.trim()}>
              {t('chatbot.send')}
            </button>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{t('chatbot.settings')}</h2>
              <button className="modal-close" onClick={() => setShowSettings(false)}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="2" y1="2" x2="14" y2="14"/>
                  <line x1="14" y1="2" x2="2" y2="14"/>
                </svg>
              </button>
            </div>
            <div className="modal-form">
              <div className="field">
                <span>{t('chatbot.apiKey')}</span>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => saveApiKey(e.target.value)}
                  placeholder={t('chatbot.apiKeyPlaceholder')}
                />
              </div>
              <div className="field">
                <span>{t('chatbot.baseUrl')}</span>
                <select className="field-select" value={providerLabel} onChange={(e) => selectProvider(e.target.value)}>
                  <option value="" disabled>—</option>
                  {PROVIDERS.map((p) => (
                    <option key={p.label} value={p.label}>{p.label}</option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary" onClick={handleFetchModels} disabled={fetchingModels || !apiKey}>
                {fetchingModels ? t('common.loading') : t('chatbot.fetchModels')}
              </button>
              {modelError && <p className="field-hint" style={{ color: 'var(--danger)' }}>{modelError}</p>}
              {models.length > 0 && (
                <div className="field">
                  <span>{t('chatbot.selectModel')}</span>
                  <select className="field-select" value={model} onChange={(e) => saveModel(e.target.value)}>
                    <option value="">—</option>
                    {models.map((m) => (
                      <option key={m.id} value={m.id}>{m.id}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
