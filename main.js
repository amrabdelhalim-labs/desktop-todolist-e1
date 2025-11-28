const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let addWindow;

const mainMenuTemplate = [
    {
        label: 'القائمة',
        submenu: [
            {
                label: 'إضافة مهمة نصية',
                click() {
                    intitAddWindow();
                },
            },
            {
                label: 'خروج',
                accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click() {
                    app.quit();
                },
            },
        ],
    },
];

const intitAddWindow = () => {
    addWindow = new BrowserWindow({
        width: 400,
        height: 250,
        title: 'إضافة مهمة نصية',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    addWindow.loadFile('./views/normalTask.html');
    addWindow.removeMenu();

    addWindow.on('closed', (e) => {
        e.preventDefault();
        addWindow = null;
    });
};

app.on('ready', () => {
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

    mainWindow = new BrowserWindow({
        width: 800,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: process.env.NODE_ENV !== 'production',
        },
    });

    mainWindow.loadFile('index.html');
    Menu.setApplicationMenu(mainMenu);
});

ipcMain.on("add-normal-task", (e, task) => {
    mainWindow.webContents.send("add-normal-task", task);
    addWindow.close();
});

ipcMain.on("new-normal-task", () => {
    intitAddWindow();
});

ipcMain.on("create-txt", (e, taskNote) => {
    dialog.showSaveDialog({
        title: "تصدير المهمة كملف نصي",
        defaultPath: "task.txt",
        buttonLabel: "تصدير",
        filters: [
            { name: 'Text Files', extensions: ['txt'] },
            { name: 'All Files', extensions: ['*'] }
        ],
    }).then((file) => {
        if (!file.canceled) {
            fs.writeFile(file.filePath.toString(), taskNote, (err) => {
                if (err) throw err;
            });
        };
    }).catch((err) => {
        console.log(err);
    });
});

if (process.env.NODE_ENV !== "production") {
    mainMenuTemplate.push({
        label: "أدوات المطور",
        submenu: [
            {
                label: "فتح وإغلاق أدوات المطور",
                accelerator: process.platform === 'darwin' ? 'Cmd+D' : 'Ctrl+D',
                click() {
                    mainWindow.toggleDevTools();
                }
            },
            {
                label: "إعادة تحميل التطبيق",
                role: "reload"
            }
        ],
    });
};