// main.js
const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});

// Function to open a file dialog and load the selected video file
function openFile() {
  const file = dialog.showOpenDialogSync(mainWindow, {
    filters: [{ name: 'Videos', extensions: ['mp4', 'webm', 'mkv', 'avi'] }],
    properties: ['openFile'],
  });

  if (file) {
    mainWindow.webContents.send('load-video', file[0]);
  }
}

// Add a listener for the 'open-file' event from the renderer process
app.on('ready', () => {
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('app-ready');
  });

  // Listen for the 'open-file' event from the renderer process
  app.on('open-file', (event, file) => {
    event.preventDefault();
    mainWindow.webContents.send('load-video', file);
  });
});

ipcMain.on('open-file', () => {
  openFile();
});

module.exports = { openFile };
