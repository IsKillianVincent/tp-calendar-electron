declare global {
    interface Window {
        electron: {
            addEvent: (date: string, title: string) => Promise<{ id: number, date: string, title: string }>;
            getEvents: () => Promise<{ id: number, date: string, title: string }[]>;
            deleteEvent: (id: number) => Promise<void>;
        };
    }
}

export {};
