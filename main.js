const { app, BrowserWindow, Menu } = require('electron');
const log = require('electron-log');

// SET ENV
process.env.NODE_ENV = 'development';
// process.env.NODE_ENV = 'production';

const isDev = process.env.NODE_ENV !== 'production' ? true : false;
const isMac = process.env.NODE_ENV === 'darwin' ? true : false;

let mainWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: 'SysTop',
    width: isDev ? 1000 : 355,
    height: 700,
    icon: './assets/icons/icon.png',
    resizeable: isDev ? true : false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadFile(`${__dirname}/app/index.html`);
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

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
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
