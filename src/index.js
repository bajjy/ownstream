const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const http = require('http');
const fs = require('fs');
const path = require('path');
const ngrok = require('ngrok');
const server = require('./public/server');

const base = app.getAppPath();
const port = 1489;
var ngrokApi;
var url;
var tunnels;

global.shareObject = {
    paths: {
        pub: path.resolve(base, 'public')
    },
    stream: {}
};


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
    app.quit();
};


app.commandLine.appendSwitch("ignore-certificate-errors");

function setMainMenu() {
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Restart',
                    //accelerator: 'Shift+CmdOrCtrl+H',
                    click() {
                        app.relaunch();
                        app.exit();
                    }
                },
                {
                    label: 'Exit',
                    //accelerator: 'Shift+CmdOrCtrl+H',
                    click() {
                        app.quit();
                    }
                }
            ]
        }
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}
const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        title: "Ownstream",
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false
        },
        backgroundColor: '#36363a',
        icon: path.join(__dirname, '../', 'assets/icons/png/64x64.png')
    });

    mainWindow.on('page-title-updated', e => e.preventDefault());
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
    mainWindow.setTitle('Ownstream');
    //mainWindow.webContents.openDevTools();
    setMainMenu();
    
    global.shareObject['server'] = server;
};


function init() {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on('ready', createWindow);

    // Quit when all windows are closed.
    app.on('window-all-closed', () => {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    app.on('activate', () => {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
};
init();

ipcMain.on('kill', async () => {
    url = false;
    await ngrok.disconnect();
    ngrok.kill();
    server.stopServer();
});
ipcMain.on('ngrok', async (event, arg) => {
    if (!url) url = await ngrok.connect(port);
    ngrokApi = ngrok.getApi();
    tunnels = await ngrokApi.get('api/tunnels');
    console.log(arg)
    server.runServer(arg);
    event.reply('async-ngrok', { url, tunnels: JSON.parse(tunnels) })
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.