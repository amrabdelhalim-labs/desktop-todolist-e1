const { contextBridge, ipcRenderer } = require('electron');
const { receiveChannels, sendChannels } = require('./ipcChannels');

contextBridge.exposeInMainWorld('api', {
    send: (channel, ...data) => {
        // السماح بقنوات محددة فقط للأمان
        if (sendChannels.includes(channel)) {
            ipcRenderer.send(channel, ...data);
        };
    },

    receive: (channel, func) => {
        if (receiveChannels.includes(channel)) {
            // إزالة الحدث (event) من الوسائط لتجنب تسريب كائنات داخلية
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        };
    }
});
