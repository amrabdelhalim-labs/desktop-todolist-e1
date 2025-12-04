const { app, BrowserWindow, Menu, ipcMain, dialog, Notification } = require('electron');
const path = require('path');
const fs = require('fs');

const appPath = app.getPath('userData');

let mainWindow,
    addWindow,
    timedWindow,
    imagedWindow;

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
                label: 'إضافة مهمة مؤقتة',
                click() {
                    createTimedWindow();
                },
            },
            {
                label: 'إضافة مهمة مع صورة',
                click() {
                    createImagedWindow();
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

    addWindow.loadFile(path.join(__dirname, './views/normalTask.html'));
    addWindow.removeMenu();

    addWindow.on('closed', (e) => {
        e.preventDefault();
        addWindow = null;
    });
};

const createTimedWindow = () => {
    timedWindow = new BrowserWindow({
        width: 400,
        height: 400,
        title: 'إضافة مهمة مؤقتة',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    timedWindow.loadFile(path.join(__dirname, './views/timedTask.html'));
    timedWindow.removeMenu();

    timedWindow.on('closed', (e) => {
        e.preventDefault();
        timedWindow = null;
    });
};

const createImagedWindow = () => {
    imagedWindow = new BrowserWindow({
        width: 400,
        height: 420,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    imagedWindow.loadFile(path.join(__dirname, './views/imagedTask.html'));
    imagedWindow.removeMenu();

    imagedWindow.on('closed', (e) => {
        e.preventDefault();
        imagedWindow = null;
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

ipcMain.on("add-timed-task", (e, note, time) => {
    mainWindow.webContents.send("add-timed-task", note, time);
    timedWindow.close();
});

ipcMain.on("add-imaged-task", (e, note, imgUri) => {
    mainWindow.webContents.send("add-imaged-task", note, imgUri);
    imagedWindow.close();
});

ipcMain.on("new-normal-task", () => {
    intitAddWindow();
});

ipcMain.on("new-timed-task", () => {
    createTimedWindow();
});

ipcMain.on("new-imaged-task", () => {
    createImagedWindow();
});

ipcMain.on("notify", (e, taskValue) => {
    new Notification({
        title: "تذكير بالمهمة",
        body: taskValue,
        icon: path.join(__dirname, '/assets/images/icon.png')
    }).show();
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

ipcMain.on("upload-image", (e) => {
    dialog.showOpenDialog({
        title: "اختر صورة",
        properties: ['openFile'],
        filters: [
            { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
            { name: 'All Files', extensions: ['*'] }
        ],
    }).then((file) => {
        if (!file.canceled) {
            e.sender.send("open-file", file.filePaths, appPath);
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