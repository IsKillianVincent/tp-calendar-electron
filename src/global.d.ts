declare global {
    interface ElectronApi {
        addEvent(date: string, title: string): Promise<{ id: number; date: string; title: string }>;
        getEvents(): Promise<{ id: number; date: string; title: string }[]>;
        deleteEvent(id: number): Promise<void>;
        openIcs(): Promise<{ title: string; date: string }[] | null>;
        saveIcs(events: { title: string; date: string }[]): Promise<void>;
    }

    interface Window {
        electron: ElectronApi;
    }
}

export {};
