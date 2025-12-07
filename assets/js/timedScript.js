const form = document.querySelector("form");


form.addEventListener("submit", (e) => {
    let note = document.querySelector(".note").value,
        pickedHours = document.querySelector(".pick-hours").value * 3600000,
        pickedMinutes = document.querySelector(".pick-minutes").value * 60000,
        notificationTime = Date.now();

    e.preventDefault();
    notificationTime += (pickedHours + pickedMinutes);
    notificationTime = new Date(notificationTime);
    window.api.send("add-timed-task", note, notificationTime);
});