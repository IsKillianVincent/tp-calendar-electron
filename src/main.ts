import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import * as mysql from 'mysql2';

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '$QNY!JXTk7!o4s1fYL7BSIuo3XIw!q',
    database: 'calendarDB'
});

function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 1000,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    win.loadFile('src/index.html');
}

ipcMain.handle('add-event', async (event, date: string, title: string) => {
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
