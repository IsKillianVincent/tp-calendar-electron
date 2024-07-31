"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let events = [];
let currentDate = new Date();
const monthYearElement = document.getElementById('monthYear');
const calendarElement = document.getElementById('calendar');
const prevMonthButton = document.getElementById('prevMonth');
const nextMonthButton = document.getElementById('nextMonth');
const todayButton = document.getElementById('today');
function loadEvents() {
    return __awaiter(this, void 0, void 0, function* () {
        events = yield window.electron.getEvents();
    });
}
function deleteEvent(id) {
    return __awaiter(this, void 0, void 0, function* () {
        yield window.electron.deleteEvent(id);
        events = events.filter(e => e.id !== id);
        renderCalendar(currentDate);
    });
}
function renderCalendar(date) {
    calendarElement.innerHTML = '';
    const month = date.getMonth();
    const year = date.getFullYear();
    monthYearElement.textContent = date.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = (firstDay.getDay() + 6) % 7; // Ajustement pour démarrer la semaine le lundi
    const daysOfWeek = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'];
    const headerRow = document.createElement('tr');
    daysOfWeek.forEach((day, index) => {
        const th = document.createElement('th');
        th.textContent = day;
        if (index === 5 || index === 6) {
            th.classList.add('lighter');
        }
        headerRow.appendChild(th);
    });
    calendarElement.appendChild(headerRow);
    let row = document.createElement('tr');
    for (let i = 0; i < startDay; i++) {
        const td = document.createElement('td');
        row.appendChild(td);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const currentDateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const td = document.createElement('td');
        const dayNumberDiv = document.createElement('div');
        dayNumberDiv.textContent = day.toString();
        dayNumberDiv.classList.add('day-number');
        td.appendChild(dayNumberDiv);
        const dailyEvents = events.filter(event => event.date === currentDateString);
        if (dailyEvents.length > 0) {
            const eventList = document.createElement('ul');
            dailyEvents.forEach(event => {
                const li = document.createElement('li');
                li.textContent = event.title;
                li.dataset.eventId = event.id.toString();
                li.addEventListener('click', () => {
                    window.location.href = `event-detail.html?id=${event.id}`;
                });
                eventList.appendChild(li);
            });
            td.appendChild(eventList);
        }
        row.appendChild(td);
        if (row.children.length === 7) {
            calendarElement.appendChild(row);
            row = document.createElement('tr');
        }
    }
    if (row.children.length > 0) {
        calendarElement.appendChild(row);
    }
}
prevMonthButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
});
nextMonthButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
});
todayButton.addEventListener('click', () => {
    currentDate = new Date();
    renderCalendar(currentDate);
});
loadEvents().then(() => {
    renderCalendar(currentDate);
});
