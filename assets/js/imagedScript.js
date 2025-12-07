const form = document.querySelector("form");

let fileName, //معرف اسم الصوره
    filePath, //معرف المسار الجديد
    imagePath; //معرف المسار الاصلى للصوره


let btn = document.querySelector(".img-upload"),
    urlImg = document.querySelector(".url-image__input");


btn.addEventListener("click", () => {
    if (urlImg.value.length == 0) {
        window.api.send("upload-image");
    };
});

window.api.receive('open-file', (arg, appPath, platform) => {
    if (urlImg.value.length == 0) {
        imagePath = arg[0]; //المسار الأصلي  للصوره
        // استخراج اسم الملف من المسار بدون استخدام path.basename
        fileName = imagePath.split(/[/\\]/).pop();
        // بناء المسار الجديد
        filePath = platform === 'win32' ? appPath + '\\' + fileName : appPath + '/' + fileName;
    };
});

form.addEventListener("submit", function (e) {
    const input = document.querySelector(".note").value,
        urlImgPath = urlImg.value;

    e.preventDefault();

    if (urlImg.value.length == 0) {
        //نسخ الصوره المختارة إلى المكان المخصص لها
        window.api.send("copy-image", {imagePath, filePath});
        window.api.send("add-imaged-task", input, filePath);
    } else if (urlImg.value.length !== 0) {
        window.api.send("add-imaged-task", input, urlImgPath);
    };
});