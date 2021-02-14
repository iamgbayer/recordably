const electron = require('electron')
const path = require('path')
const isDev = require('electron-is-dev')

const { app, Tray, Menu, globalShortcut, ipcMain, nativeImage } = electron

const BrowserWindow = electron.BrowserWindow

let window
let tray

const createTray = () => {
  const trayIcon = path.join(__dirname, '../icons/icon.png')

  console.log(path.join(__dirname, '../icons/icon.png'))

  tray = new Tray(nativeImage.createFromPath(trayIcon))

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show',
      type: 'normal',
      accelerator: 'PrintScreen',
      click() {
        window.show()
      }
    },
    {
      label: 'Quit',
      type: 'normal',
      click() {
        app.quit()
      }
    }
  ])

  tray.setToolTip('Screenshot Snipping Tool')
  tray.setContextMenu(contextMenu)

  globalShortcut.register('PrintScreen', () => {
    window && window.show()
  })
}

const createWindow = () => {
  window = new BrowserWindow({
    transparent: true,
    frame: false,
    resizable: false,
    skipTaskbar: true,
    kiosk: true,
    fullscreen: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true
    }
  })

  window.setMenuBarVisibility(false)

  window.loadURL(
    isDev
      ? 'http://localhost:3006'
      : `file://${path.join(app.getAppPath(), 'build/index.html')}`
  )

  // window.webContents.openDevTools({ detached: true })

  window.on('closed', () => (window = null))
}

ipcMain.on('minimize', () => window.hide())

app.on('ready', () => {
  createWindow()
  createTray()
})

app.on('window-all-closed', () => {
  process.platform !== 'darwin' && app.quit()
})

app.on('activate', () => {
  window === null && createWindow()
})
