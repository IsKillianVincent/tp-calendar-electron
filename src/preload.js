const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    addEvent: (date, title) => ipcRenderer.invoke('add-event', date, title),
    getEvents: () => ipcRenderer.invoke('get-events'),
    deleteEvent: (number) => ipcRenderer.invoke('delete-event', number),
    updateEvent: (event) => ipcRenderer.invoke('update-event', event)
});
