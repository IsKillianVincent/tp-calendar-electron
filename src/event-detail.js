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
        eventDateInput.value = event.date;
        eventTitleInput.value = event.title;
    }
}

eventDetailForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const updatedEvent = {
        id: eventId,
        date: eventDateInput.value,
        title: eventTitleInput.value
    };
    await window.electron.updateEvent(updatedEvent);
    window.location.href = 'index.html';
});

deleteButton.addEventListener('click', async (e) => {
    e.preventDefault();
    await window.electron.deleteEvent(eventId);
    window.location.href = 'index.html';
});

loadEventDetails();
