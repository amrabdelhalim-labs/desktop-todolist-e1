const newImaged = document.querySelector(".todo--images .add-new-task");

const addImagedTask = (note, imgURI) => {
    connection.insert({
        into: 'imaged',
        values: [{
            note: note,
            img_uri: imgURI
        }]
    }).then(() => showImaged());
};

//تابع تحديث مهمة ذات صورة
const updateImagedTask = (taskId, taskValue) => {
    connection.update({
        in: 'imaged',
        where: {
            id: taskId
        },
        set: {
            note: taskValue
        }
    }).then(() => showImaged());
};

//تابع حذف مهمة ذات صورة
const deleteImagedTask = (tasksId, imgPath) => {
    if (imgPath) {
        //إرسال طلب حذف الصورة إلى العملية الرئيسية
        window.api.send("delete-image", imgPath);
    };

    return connection.remove({
        from: 'imaged',
        where: {
            id: tasksId
        }
    }).then(() => showImaged());
};

//تابع اظهار المهام ذات صورة
const showImaged = () => {
    const clearImagedBtn = document.querySelector(".todo--images .clear-all"),
        imagedList = document.querySelector(".todo--images__list");

    imagedList.innerHTML = '';

    connection.select({
        from: 'imaged'
    }).then((tasks) => {
        if (tasks.length == 0) {
            clearImagedBtn.classList.remove("clear-all--show");
            imagedList.innerHTML = '<li class="empty-list">لا توجد مهام</li>';
        } else {
            //اظهار زر حذف جميع المهام فى حالة وجود مهام
            clearImagedBtn.classList.add("clear-all--show");

            //حذف جميع المهام ذات صورة
            clearImagedBtn.addEventListener("click", () => {
                return connection.remove({
                    from: 'imaged'
                }).then(() => showImaged());
            });

            for (let task of tasks) {
                //انشاء العناصر الخاصة بقائمة المهام ذات الصور فى هيكلية الصفحة 
                const listItem = document.createElement('li'),
                    imageHolder = document.createElement('div'),
                    noteContentHolder = document.createElement('div'),
                    taskInput = document.createElement('input'),
                    buttonsHolder = document.createElement('div'),
                    taskImage = document.createElement('img'),
                    exportBTN = document.createElement('button'),
                    deleteBTN = document.createElement('button'),
                    updateBTN = document.createElement('button');

                //إضافة صفة إلى العنصر الذي يحوي الأزرار
                buttonsHolder.classList.add("buttons-holder");

                //إضافة محتوى نصى لكل زر
                deleteBTN.innerHTML = "حذف <i class='fas fa-trash-alt'></i>";
                updateBTN.innerHTML = "تحديث <i class='fas fa-cloud-upload-alt'></i>";
                exportBTN.innerHTML = "تصدير <i class='fas fa-file-export'></i>";

                //إضافة خصائص لعناصر المهمة
                taskInput.value = task.note;
                // تحويل المسار المحلي إلى file:// URI
                let imgSrc = task.img_uri;
                if (!imgSrc.startsWith('http') && !imgSrc.startsWith('data:')) {
                    imgSrc = 'file:///' + imgSrc.replace(/\\/g, '/');
                };
                taskImage.setAttribute("src", imgSrc);
                taskInput.setAttribute('id', task.id);

                //إضافة حدث على زر تصدير المهمة كملف نصى
                exportBTN.addEventListener("click", () => {
                    window.api.send("create-txt", task.note);
                });

                //إضافة حدث على زر حذف المهمة
                deleteBTN.addEventListener('click', () => {
                    deleteImagedTask(task.id, task.img_uri);
                });

                //إضافة حدث على زر تحديث المهمة
                updateBTN.addEventListener('click', () => {
                    updateImagedTask(task.id, taskInput.value);
                });

                clearImagedBtn.addEventListener("click", () => {
                    //إرسال طلب حذف الصورة من ملفات التطبيق عند حذف كل المهام
                    window.api.send("delete-image", task.img_uri);
                });

                // إرفاق العناصر إلى الحاويات الخاصة بها
                imageHolder.appendChild(taskImage);
                buttonsHolder.appendChild(deleteBTN);
                buttonsHolder.appendChild(updateBTN);
                buttonsHolder.appendChild(exportBTN);

                //إرفاق محتوى المهمة إلى الحاوى الخاص به
                noteContentHolder.appendChild(taskInput);
                noteContentHolder.appendChild(buttonsHolder);

                //إرفاق العنصر الحاوى إلى القائمة
                listItem.appendChild(noteContentHolder);
                listItem.appendChild(imageHolder);

                //إرفاق عنصر القائمة إلى القائمة الخاصة بالمهام ذات صورة
                imagedList.appendChild(listItem)
            };
        };
    });
};

//استدعاء تابع اظهار المهام ذات صورة
showImaged();

//إرسال حدث لإنشاء نافذة جديدة إلى العملية الرئيسية
newImaged.addEventListener("click", () => {
    window.api.send("new-imaged-task");
});

//استقبال حدث إضافة مهمة ذات صورة من العملية الرئيسية 
window.api.receive('add-imaged-task', (note, imgURI) => {
    addImagedTask(note, imgURI);
});