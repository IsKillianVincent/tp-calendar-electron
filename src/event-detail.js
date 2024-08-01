const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('id');

const eventDetailForm = document.getElementById('eventDetailForm');
const eventDateInput = document.getElementById('eventDate');
const eventTitleInput = document.getElementById('eventTitle');
const deleteButton = document.getElementById('deleteButton');

async function loadEventDetails() {
    const events = await window.electron.getEvents();
    const event = events.find(e => e.id == eventId);
    console.log(events)
    if (event) {
        // Convertir la date ISO en objet Date
        const [year, month, day] = event.date.split("-").map(Number);
        let dateObject = new Date(year, month - 1, day); // Les mois commencent à 0 donc on retire 1

        dateObject.setDate(dateObject.getDate() + 1);
        const newYear = dateObject.getFullYear();
        const newMonth = (dateObject.getMonth() + 1).toString().padStart(2, '0'); // Ajouter 1 car les mois commencent à 0
        const newDay = dateObject.getDate().toString().padStart(2, '0');

        eventDateInput.value = `${newYear}-${newMonth}-${newDay}`;
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
