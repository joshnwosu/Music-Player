const electron = require('electron');
const {app, BrowserWindow, Menu} = electron;
const url = require('url');
const path = require('path');

var mainWindow = null;

app.on('ready', function() {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 580,
        webPrefrences: {
            webSecurity: false
        }
    });

    mainWindow.webContents.openDevTools();

    var template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Quit',
                    accelerator: 'CommandOrControl+Q',
                    click() {
                        app.quit();
                    }
                },{
                    role: 'reload'
                }
            ]
        }
    ];

    var menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));
});




   

