const { app, BrowserWindow, Menu, ipcMain, dialog, Notification, Tray, shell } = require('electron');
const path = require('path');
const fs = require('fs');

const appPath = app.getPath('userData');

// منع تشغيل نسخ متعددة من التطبيق (Single Instance Lock)
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
}

// ضبط معرف التطبيق لنظام ويندوز (لظهور الإشعارات بشكل صحيح)
if (process.platform === 'win32') {
    app.setAppUserModelId('com.amrabdelhalim.todolist');
}

let mainWindow,
    addWindow,
    timedWindow,
    imagedWindow;

let tray = null;

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

if (process.platform === 'darwin') {
    mainMenuTemplate.unshift({});
};

const createTray = () => {
    const trayIcon = new Tray(path.join(__dirname, './assets/images/icon.png'));
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'إظهار التطبيق',
            click: () => {
                if (mainWindow) mainWindow.show();
            },
        },
        {
            label: 'إغلاق التطبيق',
            click: () => {
                app.quit();
            },
        },
    ]);

    trayIcon.on('click', () => {
        if (mainWindow) mainWindow.show();
    });

    trayIcon.setContextMenu(contextMenu);
    trayIcon.setToolTip('تطبيق إدارة المهام');

    return trayIcon;
};

// دالة منفصلة لإنشاء النافذة الرئيسية (Refactoring)
const createMainWindow = () => {
    if (mainWindow) return; // منع إنشاء نافذة جديدة إذا كانت موجودة

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

    mainWindow = new BrowserWindow({
        width: 800,
        height: 700,
        webPreferences: {
            // إعدادات الأمان الموصى بها
            nodeIntegration: false, 
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'), // تأكد من وجود هذا الملف
        },
    });

    mainWindow.loadFile('index.html');
    Menu.setApplicationMenu(mainMenu);

    // --- تحسينات الأمان وتجربة المستخدم ---

    // 1. فتح الروابط الخارجية في المتصفح الافتراضي
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    // 2. منع التنقل غير المصرح به داخل النافذة
    mainWindow.webContents.on('will-navigate', (event, url) => {
        if (url !== mainWindow.webContents.getURL()) {
            event.preventDefault();
            shell.openExternal(url);
        }
    });

    // --- أحداث النافذة ---

    // تصغير النافذة إلى الـ Tray
    mainWindow.on('minimize', (event) => {
        event.preventDefault();
        mainWindow.hide();
        tray = createTray();
    });

    // استعادة النافذة
    mainWindow.on('restore', () => {
        mainWindow.show();
        if (tray) tray.destroy();
    });

    // عند الإغلاق
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
};

// النوافذ الفرعية (مع تحديث إعدادات الأمان)
const intitAddWindow = () => {
    if (addWindow) return;
    
    addWindow = new BrowserWindow({
        width: 400,
        height: 250,
        title: 'إضافة مهمة نصية',
        parent: mainWindow, // جعلها تابعة للرئيسية
        modal: true,        // جعلها مشروطة (Modal)
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
    });

    addWindow.loadFile(path.join(__dirname, './views/normalTask.html'));
    addWindow.removeMenu();

    addWindow.on('closed', (e) => {
        addWindow = null;
    });
};

const createTimedWindow = () => {
    if (timedWindow) return;

    timedWindow = new BrowserWindow({
        width: 400,
        height: 400,
        title: 'إضافة مهمة مؤقتة',
        parent: mainWindow,
        modal: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            backgroundThrottling: false, // لضمان عمل المؤقت في الخلفية
            preload: path.join(__dirname, 'preload.js')
        },
    });

    timedWindow.loadFile(path.join(__dirname, './views/timedTask.html'));
    timedWindow.removeMenu();

    timedWindow.on('closed', (e) => {
        timedWindow = null;
    });
};

const createImagedWindow = () => {
    if (imagedWindow) return;

    imagedWindow = new BrowserWindow({
        width: 400,
        height: 420,
        title: 'إضافة مهمة مع صورة',
        parent: mainWindow,
        modal: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
    });

    imagedWindow.loadFile(path.join(__dirname, './views/imagedTask.html'));
    imagedWindow.removeMenu();

    imagedWindow.on('closed', (e) => {
        imagedWindow = null;
    });
};

// --- دورة حياة التطبيق (App Lifecycle) ---

// 1. عند جاهزية التطبيق
app.on('ready', () => {
    createMainWindow();
    
    // التعامل مع النسخة الثانية (إذا حاول المستخدم فتح التطبيق وهو يعمل بالفعل)
    app.on('second-instance', () => {
        mainWindow = BrowserWindow.getAllWindows()[0];

        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        };
    });
});

// 2. عند إغلاق جميع النوافذ
app.on('window-all-closed', (e) => {
    if (process.platform !== 'darwin') {
        app.quit();
    };
});

// 3. عند التنشيط (خاص بـ macOS)
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    };
});

// --- معالجة الرسائل (IPC Handlers) ---

ipcMain.on("add-normal-task", (e, task) => {
    if (mainWindow) mainWindow.webContents.send("add-normal-task", task);
    if (addWindow) addWindow.close();
});

ipcMain.on("add-timed-task", (e, note, time) => {
    if (mainWindow) mainWindow.webContents.send("add-timed-task", note, time);
    if (timedWindow) timedWindow.close();
});

ipcMain.on("add-imaged-task", (e, note, imgUri) => {
    if (mainWindow) mainWindow.webContents.send("add-imaged-task", note, imgUri);
    if (imagedWindow) imagedWindow.close();
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
        if (!file.canceled && file.filePath) {
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
        if (!file.canceled && file.filePaths.length > 0) {
            e.sender.send("open-file", file.filePaths, appPath, process.platform);
        };
    }).catch((err) => {
        console.log(err);
    });
});

// نسخ الصورة إلى مجلد التطبيق
ipcMain.on("copy-image", (e, data) => {
    const { imagePath, filePath } = data;
    
    if (imagePath && filePath) {
        fs.copyFile(imagePath, filePath, (err) => {
            if (err) {
                console.error('خطأ في نسخ الصورة:', err);
            } else {
                console.log('✅ تم نسخ الصورة بنجاح إلى:', filePath);
            };
        });
    };
});

// حذف الصورة من مجلد التطبيق
ipcMain.on("delete-image", (e, imgPath) => {
    if (imgPath && fs.existsSync(imgPath)) {
        fs.unlink(imgPath, (err) => {
            if (err) {
                console.error('خطأ في حذف الصورة:', err);
            } else {
                console.log('✅ تم حذف الصورة بنجاح:', imgPath);
            };
        });
    };
});