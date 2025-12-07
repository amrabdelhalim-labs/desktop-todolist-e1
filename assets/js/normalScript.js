const form = document.querySelector("form");

form.addEventListener("submit", (e) => {
    const input = document.querySelector("#task").value;

    e.preventDefault();
    window.api.send("add-normal-task", input);
});