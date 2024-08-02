const eventForm = document.getElementById('eventForm') as HTMLFormElement;

eventForm.addEventListener('submit', async (e: Event) => {
    e.preventDefault();
    const eventDateInput = document.getElementById('eventDate') as HTMLInputElement;
    const eventTitleInput = document.getElementById('eventTitle') as HTMLInputElement;

    const eventDate = eventDateInput.value;
    const eventTitle = eventTitleInput.value;

    if (eventDate && eventTitle) {
        const utcDate = new Date(eventDate).toISOString().split('T')[0];
        await window.electron.addEvent(utcDate, eventTitle);
        window.electron.onReloadCalendar(() => {
            console.log("Calendar reloaded");
        });
        await window.electron.closeWindow();
    }
});
