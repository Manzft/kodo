const { app, BrowserWindow } = require('electron')
const { spawn } = require('child_process')
const path = require('path')
const net = require('net')
const http = require('http')

const DEV = !app.isPackaged
const PORT = 5000

const ROOT = path.resolve(__dirname, '..')
const DIST = path.resolve(ROOT, 'dist')
const BACKEND = DEV
  ? path.resolve(ROOT, '..', 'backend')
  : path.resolve(process.resourcesPath, 'backend')

let flask = null

function waitForPort(port, timeout = 15000) {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    function check() {
      const s = new net.Socket()
      s.setTimeout(300)
      s.on('connect', () => { s.destroy(); resolve() })
      s.on('error', () => { s.destroy() })
      s.on('timeout', () => { s.destroy() })
      s.connect(port, '127.0.0.1')
      if (Date.now() - start > timeout) return reject(new Error('Flask did not start'))
      setTimeout(check, 200)
    }
    check()
  })
}

function startFlask() {
  return new Promise((resolve, reject) => {
    const env = {
      ...process.env,
      KODO_STATIC_DIR: DIST,
      KODO_DATA_DIR: path.join(app.getPath('userData'), 'data'),
      FLASK_DEBUG: DEV ? '1' : '0',
    }
    if (DEV) {
      const python = process.platform === 'win32' ? 'python' : 'python3'
      flask = spawn(python, [path.resolve(BACKEND, 'server.py')], {
        cwd: BACKEND, env, stdio: ['ignore', 'pipe', 'pipe'],
      })
    } else {
      const ext = process.platform === 'win32' ? '.exe' : ''
      flask = spawn(path.resolve(BACKEND, 'kodo-backend', `kodo-backend${ext}`), [], {
        env, stdio: ['ignore', 'pipe', 'pipe'],
      })
    }
    flask.stdout.on('data', (d) => process.stdout.write(`[flask] ${d}`))
    flask.stderr.on('data', (d) => process.stderr.write(`[flask] ${d}`))
    flask.on('error', reject)
    flask.on('exit', (code) => {
      if (code !== 0 && code !== null) console.log(`Flask exited with code ${code}`)
    })
    waitForPort(PORT).then(resolve).catch(reject)
  })
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 360,
    minHeight: 500,
    title: 'Kodo',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })
  win.loadURL(`http://127.0.0.1:${PORT}`)
  if (DEV) win.webContents.openDevTools()
  return win
}

app.whenReady().then(async () => {
  try {
    console.log('Starting Flask...')
    await startFlask()
    console.log('Flask ready.')
  } catch (e) {
    console.error('Failed to start Flask:', e.message)
    app.quit()
    return
  }
  createWindow()
})

app.on('window-all-closed', () => {
  if (flask) { flask.kill(); flask = null }
  app.quit()
})

app.on('before-quit', () => {
  if (flask) { flask.kill(); flask = null }
})
