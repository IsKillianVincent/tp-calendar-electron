const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('id');

const eventDetailForm = document.getElementById('eventDetailForm') as HTMLFormElement;
const eventDateInput = document.getElementById('eventDate') as HTMLInputElement;
const eventTitleInput = document.getElementById('eventTitle') as HTMLInputElement;
const deleteButton = document.getElementById('deleteButton') as HTMLButtonElement;

interface CalendarEvent {
    id: number;
    date: string;
    title: string;
}

async function loadEventDetails(eventId: number) {
    const events = await window.electron.getEvents();
    const event = events.find((e: CalendarEvent) => e.id === eventId);

    if (event) {
        const [year, month, day] = event.date.split("-").map(Number);
        let dateObject = new Date(year, month - 1, day);

        dateObject.setDate(dateObject.getDate() + 1);
        const newYear = dateObject.getFullYear();
        const newMonth = (dateObject.getMonth() + 1).toString().padStart(2, '0');
        const newDay = dateObject.getDate().toString().padStart(2, '0');

        eventDateInput.value = `${newYear}-${newMonth}-${newDay}`;
        eventTitleInput.value = event.title;
    }
}

eventDetailForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const updatedEvent: CalendarEvent = {
        id: parseInt(eventId!, 10),
        date: eventDateInput.value,
        title: eventTitleInput.value,
    };

    if (updatedEvent.id === undefined || !updatedEvent.date || !updatedEvent.title) {
        console.error('Invalid event data:', updatedEvent);
        return;
    }

    await window.electron.updateEvent(updatedEvent.id, updatedEvent.date, updatedEvent.title);
    window.location.href = 'index.html';
});

deleteButton.addEventListener('click', async (e) => {
    e.preventDefault();
    await window.electron.deleteEvent(parseInt(eventId!, 10));
    window.location.href = 'index.html';
});

window.electron.onEventDetail(async (eventId: number) => {
    await loadEventDetails(eventId);
});


if (eventId) {
    loadEventDetails(Number(eventId));
}
