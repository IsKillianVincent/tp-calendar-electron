import { app, BrowserWindow, ipcMain, Menu, MenuItemConstructorOptions } from 'electron';
import path from 'path';
import * as mysql from 'mysql2';

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '$QNY!JXTk7!o4s1fYL7BSIuo3XIw!q',
    database: 'calendarDB'
});

let win: BrowserWindow | null;

function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
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
                if (win) win.loadFile('src/add-event.html');
            },
        },
        { type: 'separator' },
        {
            label: 'Importer...',
        },
        {
            label: 'Exporter...',
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
            },
            {
                label: 'Exporter...',
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
            resolve({ id: resultSet.insertId, date, title });
        });
    });
});

ipcMain.handle('get-events', async () => {
    const sql = 'SELECT * FROM events';
    return new Promise((resolve, reject) => {
        connection.query(sql, (err, results) => {
            if (err) {
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

ipcMain.handle('delete-event', async (event, id: number) => {
    console.log('Delete event with id:', { id });
    const sql = 'DELETE FROM events WHERE id = ?';
    return new Promise<void>((resolve, reject) => {
        connection.execute(sql, [id], (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
});

ipcMain.handle('update-event', async (event, updatedEvent: { id: number, date: string, title: string }) => {
    const { id, date, title } = updatedEvent;
    console.log('Updating event with values:', { id, date, title });

    const sql = 'UPDATE events SET date = ?, title = ? WHERE id = ?';
    return new Promise<void>((resolve, reject) => {
        connection.execute(sql, [date, title, id], (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
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
