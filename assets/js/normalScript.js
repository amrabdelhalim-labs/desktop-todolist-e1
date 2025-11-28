const { ipcRenderer } = require("electron");

const form = document.querySelector("form");

form.addEventListener("submit", (e) => {
    const input = document.querySelector("#task").value;

    e.preventDefault();
    ipcRenderer.send("add-normal-task", input);
});