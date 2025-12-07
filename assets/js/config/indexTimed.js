const newTimed = document.querySelector(".todo--timed .add-new-task");

const addTimedTask = (note, notificationTime) => {
    connection.insert({
        into: 'timed',
        values: [{
            note: note,
            pick_status: 0,
            pick_time: notificationTime
        }]
    }).then(() => showTimed());
};

const updateTimedTask = (taskId, taskValue) => {
    connection.update({
        in: 'timed',
        where: {
            id: taskId
        },
        set: {
            note: taskValue
        }
    }).then(() => showTimed());
};

const deleteTimedTask = (tasksId) => {
    return connection.remove({
        from: 'timed',
        where: {
            id: tasksId
        }
    }).then(() => showTimed());
};

//تابع اظهار المهام ذات توقيت محدد
const showTimed = () => {
    const clearTimedlBtn = document.querySelector(".todo--timed .clear-all"),
        timedList = document.querySelector(".todo--timed__list");

    timedList.innerHTML = '';

    connection.select({
        from: 'timed'
    }).then((tasks) => {
        if (tasks.length == 0) {
            //اخفاء زر حذف جميع المهام فى حالة لاتوجد مهام
            clearTimedlBtn.classList.remove("clear-all--show");
            timedList.innerHTML = '<li class="empty-list">لا توجد مهام</li>';
        } else {
            clearTimedlBtn.classList.add("clear-all--show");
            clearTimedlBtn.addEventListener("click", () => {
                return connection.remove({
                    from: 'timed'
                }).then(() => showTimed())
            });

            for (let task of tasks) {
                //انشاء العناصر الخاصة بقائمة المهام المؤقتة فى هيكلية الصفحة 
                const listItem = document.createElement('li'),
                    taskInput = document.createElement('input'),
                    buttonsHolder = document.createElement('div'),
                    timeHolder = document.createElement('div'),
                    exportBTN = document.createElement('button'),
                    deleteBTN = document.createElement('button'),
                    updateBTN = document.createElement('button');

                //إضافة محتوى نصى لكل زر 
                deleteBTN.innerHTML = "حذف <i class='fas fa-trash-alt'></i>";
                updateBTN.innerHTML = "تحديث <i class='fas fa-cloud-upload-alt'></i>";
                exportBTN.innerHTML = "تصدير <i class='fas fa-file-export'></i>";

                timeHolder.classList.add("time-holder");
                buttonsHolder.classList.add("buttons-holder");
                taskInput.value = task.note;

                //تغير نص توقيت المهمة بناءً على حالة المهمة
                if (task.pick_status === 1) {
                    timeHolder.innerHTML = "جرى التنبيه فى الساعة " + task.pick_time.toLocaleTimeString();
                } else {
                    timeHolder.innerHTML = "يتم التنبيه فى الساعة " + task.pick_time.toLocaleTimeString();
                };

                //انشاء تابع يتفقد التوقيت الحإلى كل ثانية
                const checkInterval = setInterval(() => {
                    let currentDate = new Date();

                    if (task.pick_time.toString() === currentDate.toString()) {
                        window.api.send("notify", task.note);
                        connection.update({
                            in: 'timed',
                            where: {
                                id: task.id
                            },
                            set: {
                                pick_status: 1
                            }
                        }).then(() => showTimed());

                        //إزالة الاشعار وإيقاف التابع بعد تطابق التوقيت 
                        clearInterval(checkInterval);
                    };
                }, 1000);


                //إضافة حدث على زر تصدير المهمة كملف نصى
                exportBTN.addEventListener("click", () => {
                    window.api.send("create-txt", task.note);
                });

                //إضافة حدث على زر حذف المهمة
                deleteBTN.addEventListener('click', () => {
                    deleteTimedTask(task.id);
                });

                //إضافة حدث على زر تحديث المهمة
                updateBTN.addEventListener('click', () => {
                    updateTimedTask(task.id, taskInput.value);
                });

                listItem.appendChild(taskInput);
                listItem.appendChild(timeHolder);
                buttonsHolder.appendChild(deleteBTN);
                buttonsHolder.appendChild(updateBTN);
                buttonsHolder.appendChild(exportBTN);
                listItem.appendChild(buttonsHolder);
                timedList.appendChild(listItem);
            };
        };
    });
};

showTimed();

//إرسال حدث لإنشاء نافذة جديدة إلى العملية الرئيسية
newTimed.addEventListener("click", () => {
    window.api.send("new-timed-task");
});

//استقبال حدث إضافة مهمة ذات توقيت من العملية الرئيسية 
window.api.receive('add-timed-task', (note, notificationTime) => {
    addTimedTask(note, notificationTime);
});