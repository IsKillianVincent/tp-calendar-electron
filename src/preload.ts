import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    addEvent: (date: string, title: string) => ipcRenderer.invoke('add-event', date, title),
    getEvents: () => ipcRenderer.invoke('get-events'),
    deleteEvent: (id: number) => ipcRenderer.invoke('delete-event', id),
    updateEvent: (id: number, date: string, title: string) => ipcRenderer.invoke('update-event', id, date, title),
    reloadCalendar: () => ipcRenderer.invoke('reload-calendar'),
    closeWindow: () => ipcRenderer.invoke('close-window'),
    openIcs: () => ipcRenderer.invoke('open-ics'),
    saveIcs: (events: Event[]) => ipcRenderer.invoke('save-ics', events),
    getImportedEvents: () => ipcRenderer.invoke('get-imported-events'),
    importSelectedEvents: (events: Event[]) => ipcRenderer.invoke('import-selected-events', events),
    onReloadCalendar: (callback: () => void) => ipcRenderer.on('reload-calendar', callback),
    openEventDetail: (id: number) => ipcRenderer.invoke('open-event-detail', id),
    onEventDetail: (callback: (eventId: number) => void) => ipcRenderer.on('event-detail', (event, eventId: number) => callback(eventId)),
    showMessageBox: (options: Electron.MessageBoxOptions) => ipcRenderer.invoke('show-message-box', options),
});
