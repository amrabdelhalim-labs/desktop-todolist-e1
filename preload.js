const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    send: (channel, ...data) => {
        // السماح بقنوات محددة فقط للأمان
        let validChannels = [
            "add-normal-task",
            "add-timed-task",
            "add-imaged-task",
            "new-normal-task",
            "new-timed-task",
            "new-imaged-task",
            "notify",
            "upload-image",
            "create-txt",
            "copy-image",
            "delete-image"
        ];

        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, ...data);
        };
    },

    receive: (channel, func) => {
        let validChannels = [
            "add-normal-task",
            "add-timed-task",
            "add-imaged-task",
            "open-file"
        ];

        if (validChannels.includes(channel)) {
            // إزالة الحدث (event) من الوسائط لتجنب تسريب كائنات داخلية
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        };
    }
});