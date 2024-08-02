const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('id');

const eventDetailForm = document.getElementById('eventDetailForm') as HTMLFormElement;
const eventDateInput = document.getElementById('eventDate') as HTMLInputElement;
const eventTitleInput = document.getElementById('eventTitle') as HTMLInputElement;
const deleteButton = document.getElementById('deleteButton') as HTMLButtonElement;

window.electron.onEventDetail(async (eventId: number) => {
    await loadEventDetails(eventId);
});

async function loadEventDetails(eventId: number) {
    try {
        const events = await window.electron.getEvents();
        const event = events.find((e: CalendarEvent) => e.id === eventId);

        if (event) {
            const eventIdElement = document.getElementById('eventId') as HTMLInputElement;
            eventIdElement.value = event.id.toString();

            eventDateInput.value = event.date;
            eventTitleInput.value = event.title;
        } else {
            console.error('Événement non trouvé pour l\'ID :', eventId);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des détails de l\'événement :', error);
    }
}

eventDetailForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log("Form submitted");

    const eventIdElement = document.getElementById('eventId') as HTMLInputElement;
    const eventId = parseInt(eventIdElement.value, 10);
    console.log("Event ID:", eventId);

    console.log("Event Date Input Value:", eventDateInput.value);
    console.log("Event Title Input Value:", eventTitleInput.value);

    const updatedEvent = {
        id: eventId,
        date: eventDateInput.value,
        title: eventTitleInput.value,
    };

    console.log("Updated event data:", updatedEvent);

    if (isNaN(updatedEvent.id) || !updatedEvent.date || !updatedEvent.title) {
        console.error('Données de l\'événement invalides :', updatedEvent);
        return;
    }

    try {
        await window.electron.updateEvent(updatedEvent.id, updatedEvent.date, updatedEvent.title);
        console.log("Événement mis à jour avec succès");
        await window.electron.reloadCalendar();
        await window.electron.closeWindow();
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'événement :', error);
    }
});


deleteButton.addEventListener('click', async (e) => {
    e.preventDefault();
    console.log("Delete button clicked");

    const eventIdElement = document.getElementById('eventId') as HTMLInputElement;
    const eventIdNumber = parseInt(eventIdElement.value, 10);

    if (isNaN(eventIdNumber)) {
        console.error("ID d'événement invalide pour la suppression :", eventIdNumber);
        return;
    }

    try {
        await window.electron.deleteEvent(eventIdNumber);
        console.log("Événement supprimé avec succès");
        await window.electron.reloadCalendar();
        await window.electron.closeWindow();
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'événement :', error);
    }
});


if (eventId) {
    loadEventDetails(Number(eventId));
}