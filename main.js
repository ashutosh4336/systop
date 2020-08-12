const path = require('path');
const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const Store = require('./Store');
const MainWindow = require('./MainWindow');
const AppTray = require('./AppTray');

// SET ENV
// process.env.NODE_ENV = 'development';
process.env.NODE_ENV = 'production';

const isDev = process.env.NODE_ENV !== 'production' ? true : false;
const isMac = process.env.NODE_ENV === 'darwin' ? true : false;

let mainWindow;
let aboutWindow;
let tray;

// Init Store & Defaults
const store = new Store({
  configName: 'user-settings',
  defaults: {
    settings: {
      cpuOverload: 80,
      alertFrequency: 5,
    },
  },
});

function createMainWindow() {
  mainWindow = new MainWindow(`${__dirname}/app/index.html`, isDev);
}

// About Page / Window
function createAboutWindow() {
  aboutWindow = new BrowserWindow({
    title: 'About Image-Shrink',
    width: 400,
    height: 300,
    icon: './assets/icons/icon.png',
    resizable: false,
    backgroundColor: '#880e4f',
  });

  aboutWindow.loadFile(`${__dirname}/app/about.html`);
}

// Initilize App
app.on('ready', () => {
  createMainWindow();

  // send data to renderer
  mainWindow.webContents.on('dom-ready', () => {
    mainWindow.webContents.send('settings:get', store.get('settings'));
  });

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  // mainWin
  mainWindow.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }

    return true;
  });

  // Create Tray
  const icon = path.join(__dirname, 'assets', 'icons', 'tray_icon.png');
  tray = new AppTray(icon, mainWindow);

  // mainWindow.on('closed', () => {
  //   mainWindow = null;
  // });
});

// App Menus
const menu = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: 'About',
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
  {
    role: 'fileMenu',
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Toggle Navigation',
        click: () => mainWindow.webContents.send('nav:toggle'),
      },
    ],
  },
  ...(!isMac
    ? [
        {
          label: 'Help',
          submenu: [
            {
              label: 'About',
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
  ...(isDev
    ? [
        {
          label: 'Developer',
          submenu: [
            { role: 'reload' },
            { role: 'forcereload' },
            { type: 'separator' },
            { role: 'toggledevtools' },
          ],
        },
      ]
    : []),
];

// set settings
ipcMain.on('settings:set', (e, value) => {
  store.set('settings', value);

  mainWindow.webContents.send('settings:get', store.get('settings'));
});

// For Mac
app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

// Deprecation Warnings
app.allowRendererProcessReuse = true;
