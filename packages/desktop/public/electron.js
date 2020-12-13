const electron = require('electron')
const path = require('path')
const isDev = require('electron-is-dev')
const {
  default: installExtension,
  REDUX_DEVTOOLS
} = require('electron-devtools-installer')

const { app, Tray, Menu, globalShortcut, ipcMain } = electron

const BrowserWindow = electron.BrowserWindow

let window
let tray

const createTray = () => {
  const iconPath = path.join(__dirname, '../src/assets/icons/icon.png')
  tray = new Tray(iconPath)

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
  installExtension(REDUX_DEVTOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('An error occurred: ', err))

  window = new BrowserWindow({
    transparent: true,
    frame: false,
    width: 1920,
    height: 1080,
    alwaysOnTop: true,
    webPreferences: { nodeIntegration: true }
  })

  window.setMenuBarVisibility(false)
  window.setResizable(false)

  window.loadURL(
    isDev
      ? 'http://localhost:3006'
      : `file://${path.join(__dirname, '../build/index.html')}`
  )

  isDev && window.webContents.openDevTools({ detached: true })

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
