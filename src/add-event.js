const eventForm = document.getElementById('eventForm');

eventForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const eventDateInput = document.getElementById('eventDate');
    const eventTitleInput = document.getElementById('eventTitle');

    const eventDate = eventDateInput.value;
    const eventTitle = eventTitleInput.value;

    if (eventDate && eventTitle) {
        await window.electron.addEvent(eventDate, eventTitle);
        window.location.href = 'index.html';
    }
});
