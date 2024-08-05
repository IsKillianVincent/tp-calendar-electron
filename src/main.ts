import { app, BrowserWindow, ipcMain, Menu, MenuItemConstructorOptions, dialog, ipcRenderer } from 'electron';
import path from 'path';
import * as mysql from 'mysql2';
import fs from 'fs';
import ICAL from 'ical.js';
import { Component, parse } from 'ical.js';

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '$QNY!JXTk7!o4s1fYL7BSIuo3XIw!q',
    database: 'calendarDB'
});

let win: BrowserWindow | null;
let neWin: BrowserWindow | null;
let detailWin: BrowserWindow | null;

function createNewWindow() {
    neWin = new BrowserWindow({
        width: 400,
        height: 200,
        parent: win ? win : undefined,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    neWin.loadFile('src/add-event.html')
}

function createDetailWindow(eventId: number) {
    detailWin = new BrowserWindow({
        width: 400,
        height: 200,
        parent: win ? win : undefined,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    detailWin.loadFile('src/event-detail.html').then(() => {
        detailWin?.webContents.send('event-detail', eventId);
    });

    detailWin.on('closed', () => {
        detailWin = null;
    });
}

function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 600,
        minHeight: 450,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Retour au calendrier',
            click: () => {
                if (win) win.loadFile('src/index.html');
            },
        },
        { type: 'separator' },
        {
            label: 'Créer un évenment',
            click: () => {
                createNewWindow();
            },
        },
        { type: 'separator' },
        {
            label: 'Importer...',
            click: () => {
                win?.webContents.send('open-ics');
            },
        },
        {
            label: 'Exporter...',
        },
        {
            label: 'Ouvrir dev tool',
            click: () => {
                if (win) win.webContents.openDevTools();
            },
        }
        
        
    ]);

    win.webContents.on('context-menu', (event) => {
        event.preventDefault();
        contextMenu.popup();
    });

    win.loadFile('src/index.html');

    win.on('closed', () => {
        win = null;
    });
}

const template: Array<MenuItemConstructorOptions> = [
    {
        label: 'Fichier',
        submenu: [
            {
                label: 'Retour au calendrier',
                click: () => {
                    if (win) win.loadFile('src/index.html');
                },
            },
            { type: 'separator' },
            {
                label: 'Créer un évenment',
                click: () => {
                    if (win) win.loadFile('src/add-event.html');
                },
            },
            { type: 'separator' },
            {
                label: 'Importer...',
                click: async () => {
                    const result = await win?.webContents.send('open-ics');
                },
            },
            {
                label: 'Exporter...',
                click: async () => {
                    const result = await win?.webContents.send('save-ics');
                },
            },
            {
                label: 'Ouvrir dev tool',
                click: () => {
                    if (win) win.webContents.openDevTools();
                },
            }
        ],
    },
    {
        label: 'Édition',
        submenu: [
            { role: 'undo' },
            { role: 'redo' },
            { type: 'separator' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' },
            { role: 'selectAll' },
        ],
    },
    {
        label: 'Affichage',
        submenu: [
            {
                label: 'Zoom avant',
                role: 'zoomIn',
            },
            {
                label: 'Zoom arrière',
                role: 'zoomOut',
            },
            {
                label: 'Réinitialiser le zoom',
                role: 'resetZoom',
            },
            { type: 'separator' },
            { role: 'togglefullscreen' },
        ],
    },
    {
        label: 'Aide',
        submenu: [
            {
                label: 'À propos',
                click: () => {
                    console.log('À propos de cette application');
                },
            },
        ],
    },
];

ipcMain.handle('add-event', async (event, date: string, title: string) => {
    console.log('Add event with values:', { date, title });
    const sql = 'INSERT INTO events (date, title) VALUES (?, ?)';
    return new Promise((resolve, reject) => {
        connection.execute(sql, [date, title], (err, results) => {
            if (err) {
                reject(err);
                return;
            }
            const resultSet = results as mysql.ResultSetHeader;
            if (win) {
                win.webContents.send('reload-calendar');
            }
            resolve({ id: resultSet.insertId, date, title });
        });
    });
});

ipcMain.handle('get-events', async () => {
    const sql = 'SELECT * FROM events';
    return new Promise((resolve, reject) => {
        connection.query(sql, (err, results) => {
            if (err) {
                console.error('Error fetching events from database:', err);
                reject(err);
                return;
            }
            const events = (results as mysql.RowDataPacket[]).map((row) => ({
                id: row.id,
                date: row.date.toISOString().split('T')[0],
                title: row.title,
            }));
            resolve(events);
        });
    });
});

ipcMain.handle('close-window', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
        window.close();
    }
});

ipcMain.handle('reload-calendar', (event) => {
    if (win) {
        win.webContents.send('reload-calendar');
    }
});

ipcMain.handle('open-event-detail', async (event, eventId: number) => {
    if (!detailWin) {
        createDetailWindow(eventId);
    } else {
        detailWin.focus();
        detailWin.webContents.send('event-detail', eventId);
    }
});

ipcMain.handle('update-event', async (event, id, date, title) => {
    const sql = 'UPDATE events SET date = ?, title = ? WHERE id = ?';
    return new Promise<void>((resolve, reject) => {
        connection.execute(sql, [date, title, id], (err) => {
            if (err) {
                console.error('Error updating event:', err);
                reject(err);
                return;
            }
            resolve();
        });
    });
});

ipcMain.handle('show-message-box', async (event, options) => {
    if (detailWin) {
        const response = await dialog.showMessageBox(detailWin, options);
        return response;
    } else {
        console.error('detailWin est nul, ne peut pas afficher la boîte de dialogue.');
        return { response: -1 };
    }
});

ipcMain.handle('delete-event', async (event, id) => {
    console.log('Delete event with id:', { id });
    const sql = 'DELETE FROM events WHERE id = ?';
    return new Promise<void>((resolve, reject) => {
        connection.execute(sql, [id], (err) => {
            if (err) {
                console.error('Error deleting event:', err);
                reject(err);
                return;
            }
            resolve();
        });
    });
});

let importedEvents: { title: string; date: string }[] = [];

let importWin: BrowserWindow | null = null;

ipcMain.handle('get-imported-events', async () => {
    return importedEvents;
});

ipcMain.handle('save-selected-events', async (event, events) => {
    console.log('Saving selected events:', events);
    const sql = 'INSERT INTO events (date, title) VALUES (?, ?)';
    
    for (const event of events) {
        await new Promise((resolve, reject) => {
            connection.execute(sql, [event.date, event.title], (err) => {
                if (err) {
                    console.error('Error saving event:', err);
                    reject(err);
                    return;
                }
                resolve(undefined);
            });
        });
    }
});

function formatDateForICS(dateString: string) {
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

ipcMain.handle('open-ics', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'iCalendar Files', extensions: ['ics'] }]
    });

    if (result.canceled) {
        return null;
    }

    const filePath = result.filePaths[0];
    const fileData = fs.readFileSync(filePath, 'utf-8');
    const jcalData = parse(fileData);
    const component = new Component(jcalData);

    const events = component.getAllSubcomponents('vevent').map((vevent: any) => {
        const summary = vevent.getFirstPropertyValue('summary');
        const dtstart = vevent.getFirstPropertyValue('dtstart');
        const date = dtstart.toString().substring(0, 10);
        return { title: summary, date };
    });

    const response = await dialog.showMessageBox({
        type: 'question',
        buttons: ['Oui', 'Non'],
        defaultId: 0,
        message: 'Voulez-vous importer ces événements ?',
        detail: events.map((e: { date: string, title: string }) => `${e.date}: ${e.title}`).join('\n')
    });

    if (response.response === 0) {
        const sql = 'INSERT INTO events (date, title) VALUES (?, ?)';
        for (const event of events) {
            await new Promise<void>((resolve, reject) => {
                connection.execute(sql, [event.date, event.title], (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve();
                });
            });
        }
        if (win) {
            win.webContents.send('reload-calendar');
        }
    }

    return events;
});


ipcMain.handle('save-ics', async (event, events) => {
    if (!Array.isArray(events) || events.length === 0) {
        console.error('No events to save');
        return;
    }

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
${events.map(event => (
        `BEGIN:VEVENT
SUMMARY:${event.title}
DTSTART:${formatDateForICS(event.date)}
END:VEVENT`
    )).join('\n')}
END:VCALENDAR`;

    const result = await dialog.showSaveDialog({
        filters: [{ name: 'iCalendar Files', extensions: ['ics'] }]
    });

    if (result.canceled) return;

    fs.writeFileSync(result.filePath, icsContent);
});



const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});


function extractAllBetweenMarkers(text: string, startMarker: string, endMarker: string): string[] {
    const results: string[] = [];
    let startIndex = 0;

    while (true) {
        startIndex = text.indexOf(startMarker, startIndex);

        if (startIndex === -1) break;

        const endIndex = text.indexOf(endMarker, startIndex + startMarker.length);

        if (endIndex === -1 || endIndex <= startIndex) break;

        const start = startIndex + startMarker.length;
        results.push(text.substring(start, endIndex));

        startIndex = endIndex + endMarker.length;
    }

    return results;
}