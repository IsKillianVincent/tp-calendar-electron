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
const eventForm = document.getElementById('eventForm');
eventForm.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
    const eventDateInput = document.getElementById('eventDate');
    const eventTitleInput = document.getElementById('eventTitle');
    const eventDate = eventDateInput.value;
    const eventTitle = eventTitleInput.value;
    if (eventDate && eventTitle) {
        const utcDate = new Date(eventDate).toISOString().split('T')[0];
        yield window.electron.addEvent(utcDate, eventTitle);
        window.location.href = 'index.html';
    }
}));
