import { useState, useEffect } from 'react'
import Modal from './Modal'

const PALETTES = [
  { id: 'pink', color: '#f26c8f', label: 'Coral' },
  { id: 'rose', color: '#f598b2', label: 'Rosa' },
  { id: 'blue', color: '#5c9df2', label: 'Azul' },
  { id: 'green', color: '#5cb85c', label: 'Verde' },
  { id: 'purple', color: '#b478d9', label: 'Púrpura' },
  { id: 'orange', color: '#e8944a', label: 'Naranja' },
]

const LIGHT_VARS = {
  '--bg': '#f0f0f8',
  '--sidebar': '#ffffff',
  '--surface': '#ffffff',
  '--surface-hover': '#e8e8f2',
  '--text': '#1a1a2e',
  '--text-muted': '#7a7a9a',
  '--border': '#d0d0e4',
  '--danger': '#d93a32',
  '--danger-hover': '#e5534b',
}

const PALETTE_VARS = {
  pink: { '--accent': '#f26c8f', '--accent-hover': '#f489a5' },
  rose: { '--accent': '#f598b2', '--accent-hover': '#f7b0c5' },
  blue: { '--accent': '#5c9df2', '--accent-hover': '#7ab4f5' },
  green: { '--accent': '#5cb85c', '--accent-hover': '#6fcc6f' },
  purple: { '--accent': '#b478d9', '--accent-hover': '#c992e6' },
  orange: { '--accent': '#e8944a', '--accent-hover': '#f0aa6a' },
}

function applyTheme(theme) {
  const root = document.documentElement
  for (const [key, val] of Object.entries(LIGHT_VARS)) {
    root.style.setProperty(key, theme === 'light' ? val : '')
  }
  localStorage.setItem('kodo-theme', theme)
}

function applyPalette(paletteId) {
  const root = document.documentElement
  for (const [key, val] of Object.entries(PALETTE_VARS[paletteId] || {})) {
    root.style.setProperty(key, val)
  }
  localStorage.setItem('kodo-palette', paletteId)
}

export default function Settings({ open, onClose }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('kodo-theme') || 'dark')
  const [palette, setPalette] = useState(() => localStorage.getItem('kodo-palette') || 'pink')

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    applyPalette(palette)
  }, [palette])

  return (
    <Modal open={open} onClose={onClose} title="Ajustes">
      <div className="settings-body">
        <div className="settings-section">
          <label className="settings-label">Tema</label>
          <div className="theme-toggle">
            <button
              className={`theme-btn${theme === 'dark' ? ' active' : ''}`}
              onClick={() => setTheme('dark')}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M7 1a5.5 5.5 0 1 0 5 7 4 4 0 0 1-5-7z"/>
              </svg>
              Oscuro
            </button>
            <button
              className={`theme-btn${theme === 'light' ? ' active' : ''}`}
              onClick={() => setTheme('light')}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="7" cy="7" r="3"/>
                <line x1="7" y1="1" x2="7" y2="2"/>
                <line x1="7" y1="12" x2="7" y2="13"/>
                <line x1="1" y1="7" x2="2" y2="7"/>
                <line x1="12" y1="7" x2="13" y2="7"/>
                <line x1="2.5" y1="2.5" x2="3.2" y2="3.2"/>
                <line x1="10.8" y1="10.8" x2="11.5" y2="11.5"/>
                <line x1="2.5" y1="11.5" x2="3.2" y2="10.8"/>
                <line x1="10.8" y1="3.2" x2="11.5" y2="2.5"/>
              </svg>
              Claro
            </button>
          </div>
        </div>

        <div className="settings-section">
          <label className="settings-label">Paleta de colores</label>
          <div className="palette-grid">
            {PALETTES.map(p => (
              <button
                key={p.id}
                className={`palette-btn${palette === p.id ? ' active' : ''}`}
                style={{ '--swatch': p.color }}
                onClick={() => setPalette(p.id)}
                title={p.label}
              >
                <span className="palette-swatch" />
              </button>
            ))}
          </div>
        </div>

        <div className="settings-footer">
          <a
            className="settings-credit"
            href="https://github.com/manzft"
            target="_blank"
            rel="noopener noreferrer"
          >
            Manzft &mdash; 2026
          </a>
          <span className="settings-version">v1.0</span>
        </div>
      </div>
    </Modal>
  )
}
