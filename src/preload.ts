import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    addEvent: async (date: string, title: string) => {
        return await ipcRenderer.invoke('add-event', date, title);
    },
    getEvents: async () => {
        return await ipcRenderer.invoke('get-events');
    },
    deleteEvent: async (id: number) => {
        return await ipcRenderer.invoke('delete-event', id);
    },
    updateEvent: async (id: number, date: string, title: string) => {
        return await ipcRenderer.invoke('update-event', { id, date, title });
    },
    openIcs: async () => {
        return await ipcRenderer.invoke('open-ics');
    },
    saveIcs: async (events: { title: string; date: string }[]) => {
        return await ipcRenderer.invoke('save-ics', events);
    }
});
