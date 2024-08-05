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
const todayButton = document.getElementById('today') as HTMLButtonElement;

async function loadEvents() {
    try {
        events = await window.electron.getEvents();
    } catch (error) {
        console.error('Erreur lors du chargement des événements:', error);
    }
}

async function deleteEvent(id: number) {
    try {
        await window.electron.deleteEvent(id);
        events = events.filter(e => e.id !== id);
        renderCalendar(currentDate);
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'événement:', error);
    }
}

function renderCalendar(date: Date) {
    calendarElement.innerHTML = '';
    const month = date.getMonth();
    const year = date.getFullYear();
    const constDateToLocal = date.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
    monthYearElement.textContent = constDateToLocal.charAt(0).toUpperCase() + constDateToLocal.slice(1);
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDay.getDate();
    const startDay = (firstDay.getDay() + 6) % 7;

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

    const todayString = new Date().toLocaleDateString(); 

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const currentDateString = date.toISOString().split('T')[0];
        const currentDateStringLocalFormat = date.toLocaleDateString().split('T')[0];

        const td = document.createElement('td');

        const currentDate = new Date(year, month, day);
        if (currentDate.getDay() === 6 || currentDate.getDay() === 0) { 
            td.classList.add('weekend');
        }

        const dayNumberDiv = document.createElement('div');
        dayNumberDiv.textContent = day.toString();
        dayNumberDiv.classList.add('day-number');

        
        if (currentDateStringLocalFormat === todayString) {
            dayNumberDiv.classList.add('today');
        }

        td.appendChild(dayNumberDiv);

        const dailyEvents = events.filter(event => event.date === currentDateString);
        if (dailyEvents.length > 0) {
            const eventList = document.createElement('ul');
            dailyEvents.forEach(event => {
                const li = document.createElement('li');
                li.textContent = event.title;
                li.dataset.eventId = event.id.toString();
                li.addEventListener('click', () => {
                    window.electron.openEventDetail(event.id);
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

document.getElementById('openIcs')?.addEventListener('click', async () => {
    try {
        const importedEvents = await window.electron.openIcs();
        if (importedEvents) {
            console.log('Imported Events:', importedEvents);
            await loadEvents();
            renderCalendar(currentDate);
        }
    } catch (error) {
        console.error('Error importing events:', error);
    }
});

document.getElementById('saveIcs')?.addEventListener('click', async () => {
    const eventsToSave = events; 
    try {
        await window.electron.saveIcs(eventsToSave);
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des événements:', error);
    }
});

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

document.addEventListener('DOMContentLoaded', () => {
    loadEvents().then(() => {
        renderCalendar(currentDate);
    });

    window.electron.onReloadCalendar(() => {
        loadEvents().then(() => {
            renderCalendar(currentDate);
        });
    });
});
