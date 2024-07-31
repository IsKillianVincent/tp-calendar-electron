"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const mysql = __importStar(require("mysql2"));
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '$QNY!JXTk7!o4s1fYL7BSIuo3XIw!q',
    database: 'calendarDB'
});
let win;
function createWindow() {
    win = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });
    const contextMenu = electron_1.Menu.buildFromTemplate([
        {
            label: 'Retour au calendrier',
            click: () => {
                if (win)
                    win.loadFile('src/index.html');
            },
        },
        { type: 'separator' },
        {
            label: 'Créer un évenment',
            click: () => {
                if (win)
                    win.loadFile('src/add-event.html');
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
const template = [
    {
        label: 'Fichier',
        submenu: [
            {
                label: 'Retour au calendrier',
                click: () => {
                    if (win)
                        win.loadFile('src/index.html');
                },
            },
            { type: 'separator' },
            {
                label: 'Créer un évenment',
                click: () => {
                    if (win)
                        win.loadFile('src/add-event.html');
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
electron_1.ipcMain.handle('add-event', (event, date, title) => __awaiter(void 0, void 0, void 0, function* () {
    const sql = 'INSERT INTO events (date, title) VALUES (?, ?)';
    return new Promise((resolve, reject) => {
        connection.execute(sql, [date, title], (err, results) => {
            if (err) {
                reject(err);
                return;
            }
            const resultSet = results;
            resolve({ id: resultSet.insertId, date, title });
        });
    });
}));
electron_1.ipcMain.handle('get-events', () => __awaiter(void 0, void 0, void 0, function* () {
    const sql = 'SELECT * FROM events';
    return new Promise((resolve, reject) => {
        connection.query(sql, (err, results) => {
            if (err) {
                reject(err);
                return;
            }
            const events = results.map((row) => ({
                id: row.id,
                date: row.date.toISOString().split('T')[0],
                title: row.title,
            }));
            resolve(events);
        });
    });
}));
electron_1.ipcMain.handle('delete-event', (event, id) => __awaiter(void 0, void 0, void 0, function* () {
    const sql = 'DELETE FROM events WHERE id = ?';
    return new Promise((resolve, reject) => {
        connection.execute(sql, [id], (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}));
electron_1.ipcMain.handle('update-event', (event, updatedEvent) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, date, title } = updatedEvent;
    const sql = 'UPDATE events SET date = ?, title = ? WHERE id = ?';
    return new Promise((resolve, reject) => {
        connection.execute(sql, [date, title, id], (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}));
const menu = electron_1.Menu.buildFromTemplate(template);
electron_1.Menu.setApplicationMenu(menu);
electron_1.app.whenReady().then(createWindow);
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
