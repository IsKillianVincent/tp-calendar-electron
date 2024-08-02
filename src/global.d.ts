import { IpcRenderer } from 'electron';

declare global {
  interface Window {
    electron: {
      addEvent: (date: string, title: string) => Promise<{ id: number, date: string, title: string }>;
      getEvents: () => Promise<{ id: number, date: string, title: string }[]>;
      deleteEvent: (id: number) => Promise<void>;
      updateEvent: (id: number, date: string, title: string) => Promise<void>;
      reloadCalendar: () => Promise<void>;
      closeWindow: () => Promise<void>;
      openIcs: () => Promise<any>;
      saveIcs: (events: any[]) => Promise<void>;
      getImportedEvents: () => Promise<any[]>;
      importSelectedEvents: (events: any[]) => Promise<void>;
      onReloadCalendar: (callback: () => void) => void;
      openEventDetail: (id: number) => Promise<void>;
      onEventDetail: (callback: (eventId: number) => void) => void;
      updateEvent: (id: number, date: string, title: string) => Promise<void>;
    };
  }
}
