interface CalendarEvent {
    id: number;
    date: string;
    title: string;
}

let events: CalendarEvent[] = [];
let currentDate = new Date();

const monthYearElement = document.getElementById('monthYear') as HTMLHeadingElement;
const calendarElement = document.getElementById('calendar') as HTMLTableElement;
const prevMonthButton = document.getElementById('prevMonth') as HTMLButtonElement;
const nextMonthButton = document.getElementById('nextMonth') as HTMLButtonElement;

async function loadEvents() {
    events = await window.electron.getEvents();
}

async function deleteEvent(id: number) {
    await window.electron.deleteEvent(id);
    events = events.filter(e => e.id !== id);
    renderCalendar(currentDate);
}

function renderCalendar(date: Date) {
    calendarElement.innerHTML = '';
    const month = date.getMonth();
    const year = date.getFullYear();
    
    monthYearElement.textContent = date.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();

    const daysOfWeek = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const headerRow = document.createElement('tr');
    daysOfWeek.forEach(day => {
        const th = document.createElement('th');
        th.textContent = day;
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
        td.textContent = day.toString();

        const dailyEvents = events.filter(event => event.date === currentDateString);
        if (dailyEvents.length > 0) {
            const eventList = document.createElement('ul');
            dailyEvents.forEach(event => {
                const li = document.createElement('li');
                li.textContent = event.title;

                const detailLink = document.createElement('a');
                detailLink.textContent = 'Détail';
                detailLink.href = `event-detail.html?id=${event.id}`;

                li.appendChild(detailLink);
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

loadEvents().then(() => {
    renderCalendar(currentDate); 
});
