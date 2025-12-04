const { ipcRenderer } = require("electron");
const fs = require('fs');
const path = require('path');

const form = document.querySelector("form");

let fileName, //معرف اسم الصوره
    filePath, //معرف المسار الجديد
    imagePath; //معرف المسار الاصلى للصوره


let btn = document.querySelector(".img-upload"),
    urlImg = document.querySelector(".url-image__input");


btn.addEventListener("click", () => {
    if (urlImg.value.length == 0) {
        ipcRenderer.send("upload-image");
    };
});

ipcRenderer.on('open-file', (event, arg, appPath) => {
    if (urlImg.value.length == 0) {
        imagePath = arg[0]; //المسار الأصلي  للصوره
        fileName = path.basename(imagePath); //اسم الصوره  فقط
        filePath = process.platform === 'win32' ? appPath + '\\' + fileName : appPath + fileName; //المسار الجديد لحفظ الصوره
    };
});

form.addEventListener("submit", function (e) {
    const input = document.querySelector(".note").value,
        urlImgPath = urlImg.value;

    e.preventDefault();

    if (urlImg.value.length == 0) {
        //نسخ الصوره المختارة إلى المكان المخصص لها
        fs.copyFile(imagePath, filePath, (err) => {
            if (err) throw err;
        });

        ipcRenderer.send("add-imaged-task", input, filePath);
    } else if (urlImg.value.length !== 0) {
        ipcRenderer.send("add-imaged-task", input, urlImgPath);
    };
});