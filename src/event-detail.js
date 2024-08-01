const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('id');

const eventDetailForm = document.getElementById('eventDetailForm');
const eventDateInput = document.getElementById('eventDate');
const eventTitleInput = document.getElementById('eventTitle');
const deleteButton = document.getElementById('deleteButton');

async function loadEventDetails() {
    const events = await window.electron.getEvents();
    const event = events.find(e => e.id == eventId);

    if (event) {
        document.getElementById('eventId').value = event.id;
        const [year, month, day] = event.date.split("-").map(Number);
        let newDay = day + 1;
        eventDateInput.value = year + '-' + month.toString().padStart(2, '0') + '-' + newDay.toString().padStart(2, '0');

        eventTitleInput.value = event.title;
    }
}

eventDetailForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const updatedEvent = {
        id: parseInt(eventId, 10),
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
    await window.electron.deleteEvent(eventId);
    window.location.href = 'index.html';
});

loadEventDetails();
