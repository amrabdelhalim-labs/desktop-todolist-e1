const { ipcRenderer } = require("electron");
const connection = require("./connection.js");

const newTaskButton = document.querySelector(".todo--normal .add-new-task");

const addNewTask = (task) => {
    connection.insert({
        into: "tasks",
        values: [{
            note: task,
        }],
    }).then(() => showNormalTasks());
};

const updateTask = (taskId, taskValue) => {
    connection.update({
        in: 'tasks',
        where: {
            id: taskId
        },

        set: {
            note: taskValue
        }
    }).then(() => showNormalTasks());
};

const deleteTask = (tasksId) => {
    connection.remove({
        from: 'tasks',
        where: {
            id: tasksId
        }
    }).then(() => showNormalTasks());
};

const showNormalTasks = () => {
    const clearNormalBtn = document.querySelector(".todo--normal .clear-all");
    const normalTasksList = document.querySelector(".todo--normal__list");
    
    normalTasksList.innerHTML = '';

    connection.select({
        from: 'tasks'
    }).then((tasks) => {
        if (tasks.length == 0) {
            //إخفاء زر حذف جميع المهام فى حالة لا توجد مهام
            clearNormalBtn.classList.remove("clear-all--show");
            normalTasksList.innerHTML = ' <li class="empty-list">لا توجد مهام</li> ';
        } else {
            //إظهار زر حذف جميع المهام فى حالة وجود مهام
            clearNormalBtn.classList.add("clear-all--show");
            //حذف جميع المهام العادية
            clearNormalBtn.addEventListener("click", function () {
                return connection.remove({
                    from: 'tasks'
                }).then(() => showNormalTasks());
            });

            for (let task of tasks) {
                //انشاء العناصر الخاصة بقائمة المهام العادية فى هيكلية الصفحة 
                const listItem = document.createElement('li'),
                    taskInput = document.createElement('input'),
                    buttonsHolder = document.createElement('div'),
                    exportBTN = document.createElement('button'),
                    deleteBTN = document.createElement('button'),
                    updateBTN = document.createElement('button');

                //إضافة صنف إلى العنصر الذي يحوي الأزرار
                buttonsHolder.classList.add("buttons-holder");

                //إضافة محتوى نصى لكل زر
                deleteBTN.innerHTML = "حذف <i class='fas fa-trash-alt'></i>";
                updateBTN.innerHTML = "تحديث <i class='fas fa-cloud-upload-alt'></i>";
                exportBTN.innerHTML = "تصدير <i class='fas fa-file-export'></i>";

                //جعل قيمة عنصر الادخال مساوية لقيمة المهمة من قاعدة البيانات
                taskInput.value = task.note;

                //إضافة حدث على زر تصدير المهمة كملف نصي
                exportBTN.addEventListener("click", function () {
                    ipcRenderer.send("create-txt", task.note);
                });

                //إضافة حدث على زر حذف المهمة
                deleteBTN.addEventListener('click', () => {
                    deleteTask(task.id);
                });

                //إضافة حدث على زر تحديث المهمة
                updateBTN.addEventListener('click', () => {
                    updateTask(task.id, taskInput.value);
                });

                listItem.appendChild(taskInput);
                buttonsHolder.appendChild(deleteBTN);
                buttonsHolder.appendChild(updateBTN);
                buttonsHolder.appendChild(exportBTN);
                listItem.appendChild(buttonsHolder);
                normalTasksList.appendChild(listItem);
            };
        };
    });
};

showNormalTasks();

newTaskButton.addEventListener("click", () => {
    ipcRenderer.send("new-normal-task");
});

ipcRenderer.on("add-normal-task", (e, task) => {
    addNewTask(task);
});