import { app, BrowserWindow, ipcMain, Tray, Menu, session } from 'electron'
import '../renderer/store'

const path = require('path')

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') { // 检测环境
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow // 主窗口
let tray // 托盘
let todoWindow // to do 窗口
let todoIsIgnored = false // 是否开启鼠标穿透

const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080/page1.html`
  : `file://${__dirname}/page1.html`

const trayMenu = Menu.buildFromTemplate([
  {
    label: '设置',
    click: () => {
    }
  },
  {
    label: '关于',
    click: () => {

    }
  },
  {
    label: '退出',
    click: () => {
      app.quit()
    }
  },
  {
    type : 'checkbox',
    label: '开机启动',
    checked : app.getLoginItemSettings().openAtLogin,
    click : function () {
      if(!app.isPackaged){
        app.setLoginItemSettings({
          openAtLogin: !app.getLoginItemSettings().openAtLogin,
          path: process.execPath
        })
      }else{
        app.setLoginItemSettings({
          openAtLogin: !app.getLoginItemSettings().openAtLogin
        })
      }
      console.log(app.getLoginItemSettings().openAtLogin)
      console.log(!app.isPackaged);
    }
  }
])

const exeName = path.basename(process.execPath)

function createWindow () { // 创建主窗口
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 600,
    useContentSize: true,
    width: 800,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true, // 打开remote模块
      contextIsolation: false,
      webSecurity: false
    },
    frame: false
  })
  // console.log(__dirname)
  tray = new Tray(path.join(`${__static}`,'L.png'))
  tray.on('click', () => { // 单击任务栏图标显示主窗口
    mainWindow.show()
  })
  tray.setToolTip('LaityHTool')
  tray.setContextMenu(trayMenu)
  mainWindow.loadURL(winURL) // 加载页面

  mainWindow.on('closed', () => { // 关闭主窗口销毁
    mainWindow = null
  })

  const bilibiliFilter = {
    urls: ["https://*.bilibili.com/*", "http://*.bilibili.com/*", "http://*.hdslb.com/*", "https://*.bilivideo.com/*",
            "https://*/*"]
}

  session.defaultSession.webRequest.onBeforeSendHeaders(bilibiliFilter, (details, callback) => {
      details.requestHeaders['Referer'] = 'http://www.bilibili.com'
      details.requestHeaders['Cookie'] = 'SESSDATA=85895da3%2C1638958149%2C76372*61'
      callback({ requestHeaders: details.requestHeaders });
  })
}

app.setLoginItemSettings({ // 设置开机自启动
  openAtLogin: true,
  openAsHidden: false,
  path: process.execPath,
  args: [
    '--processStart', `${exeName}`
  ]
})

app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on('minWindow', () => { // 监听最小化主窗口时间
  if (mainWindow) {
    mainWindow.minimize()
  }
})

ipcMain.on('closeWindow', () => { // 监听隐藏主窗口时间
  if (mainWindow) {
    mainWindow.hide()
  }
})

ipcMain.on('startTodo', (e, options) => { // 开启Todo的桌面置顶模式
  console.log(options);
  if (todoWindow) { // 判断是否存在todoWindow
    return false
  }
  todoWindow = new BrowserWindow({
    width: 250,
    height: 400,
    // parent: mainWindow,
    // useContentSize: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true, // 打开remote模块
      contextIsolation: false,
      webSecurity: false
    },
    frame: false,
    transparent: true,
    alwaysOnTop: true
  })
  // console.log(`file://${__static}TodoWindow.html`)
  todoWindow.loadURL(`file://${__static}/TodoWindow.html`)
  todoWindow.webContents.closeDevTools()
  todoWindow.webContents.send('sendTodoSettings', options)
  todoWindow.setIgnoreMouseEvents(todoIsIgnored)
  mainWindow.hide()
})

ipcMain.on('closeTodoWindow', () => {
  if (todoWindow) {
    todoWindow.close()
    todoWindow = null // 销毁todoWindow
    mainWindow.show()
  }
})

ipcMain.on('setCookie', (e, options) =>{
  // console.log(JSON.parse(options));
  session.defaultSession.cookies.set(JSON.parse(options), (err) => {
    console.log(err);
  })
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
