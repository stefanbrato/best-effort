const addButton = document.querySelector(".push");
const taskTitle = document.querySelector(".addNew input");
const tasks = document.querySelector("ul");
const hideDoneTasksSetting = document.querySelector(".settings-hide");

let taskData = [];
let settings = {
  "hide-completed": false,
};

// add new task on click
addButton.addEventListener("click", addNewTask);
taskTitle.addEventListener("keyup", addNewTask);
hideDoneTasksSetting.addEventListener("click", hideTasks);
tasks.addEventListener("click", delegateEvent);
tasks.addEventListener("keydown", (event) => {
  // if not 'enter key' just exit here
  if (event.key !== "Enter") return;
  delegateEvent(event);
});

function updateDatabase() {
  window.localStorage.setItem("tasks", JSON.stringify(taskData));
  window.localStorage.setItem("settings", JSON.stringify(settings));
}

function delegateEvent(event) {
  let action = event.target.dataset.action;
  switch (action) {
    case "check":
      updateTaskStatus(event);
      break;
    case "remove":
      removeExistingTask(event);
      break;
    case "show-add":
      showAddLabelInput(event);
      break;
    case "add-label":
      if (event.type != "click") addLabel(event);
      break;
    case "remove-label":
      removeLabel(event);
      break;
  }
}

function addLabel(event) {
  const labelName = event.target.value;
  const parent = event.target.parentNode;
  const task = event.target.closest(".task");

  const taskIndex = taskData.findIndex((t) => t.id === Number(task.dataset.id));
  if (taskIndex < 0) return;

  let labelList = parent.querySelector(".label-list");
  let label = document.createElement("p");
  label.textContent = labelName;
  labelList.appendChild(label);

  taskData[taskIndex].labels.push(labelName);
  updateDatabase();
  event.target.value = "";
}

function removeLabel(event) {
  const labelName = event.target.textContent;
  const task = event.target.closest(".task");

  const taskIndex = taskData.findIndex((t) => t.id === Number(task.dataset.id));
  if (taskIndex < 0) return;

  taskData[taskIndex].labels = taskData[taskIndex].labels.filter(
    (l) => l !== labelName
  );

  event.target.remove();
  updateDatabase();
}

function showAddLabelInput(event) {
  let parent = event.target.parentNode;
  let labelInput = parent.querySelector(".labels");
  let isHidden = labelInput.getAttributeNames().includes("hidden");
  if (isHidden) {
    labelInput.removeAttribute("hidden");
  } else labelInput.setAttribute("hidden", "");
}

function addNewTask(event) {
  if (event.type === "keyup" && event.key !== "Enter") return;

  let newTaskId = Date.now();
  if (taskTitle.value.length === 0) alert("Please enter a task");
  else {
    // add a new task on the UI and update the database
    addTaskUI(taskTitle.value, newTaskId, false);
    addTaskToDatabase(taskTitle.value, newTaskId);
  }
  // reset input content to empty
  taskTitle.value = "";
}

function removeExistingTask(event) {
  let taskElement = event.target.parentNode;
  let taskId = taskElement.dataset.id;
  removeTaskUI(taskElement);
  removeTaskFromDatabase(taskId);
}

function addTaskToDatabase(taskName, id, labels = [], checked = false) {
  const newTask = {
    taskName,
    checked,
    id,
    labels,
  };
  taskData.push(newTask);
  updateDatabase();
}

function removeTaskFromDatabase(taskId) {
  let updatedTaskData = taskData.filter((task) => task.id !== Number(taskId));
  taskData = updatedTaskData;
  updateDatabase();
}

function updateCheckedValue(taskToUpdateId, taskToUpdateStatus) {
  const taskIndex = taskData.findIndex((t) => t.id === Number(taskToUpdateId));
  if (taskIndex < 0) return;

  taskData[taskIndex].checked = taskToUpdateStatus;
  updateDatabase();
}

function updateTaskStatus(event) {
  let taskElement = event.target.parentNode;
  let taskStatus = event.target.checked;
  let taskId = taskElement.dataset.id;
  updateCheckedAttribute(taskElement);
  updateCheckedValue(taskId, taskStatus);
}

function updateCheckedAttribute(element) {
  const attributeList = element.getAttributeNames();
  if (attributeList.find((el) => el === "checked"))
    element.removeAttribute("checked");
  else element.setAttribute("checked", "");
}

function addTaskUI(name, id, status, labels = []) {
  let template = document.createElement("template");
  template.innerHTML = `
    <li class="task" name="${name}" data-id="${id}" ${status ? "checked" : ""}>
        <input type="checkbox" data-action="check" class="check"></input>
        <p>${name}</p>
        <button type="button" data-action="remove" class="icon remove">&#9587;</button>
        <div class="labels">
          <div class="label-list">
            ${labels
              .map((l) => `<p data-action="remove-label">${l}</p>`)
              .join("")}
          </div>
          <input class="labels" data-action="add-label" list="label-list" placeholder="Add tag" hidden>
          <button data-action="show-add" class="icon add-label">&#9998;</button>
        </div>
    </li>
  `;
  //if task is checked update elements
  if (status) {
    template.content.querySelector("input").checked = true;
  }
  tasks.appendChild(template.content);
}

function removeTaskUI(task) {
  tasks.removeChild(task);
}

function hideTasks() {
  const hide = hideDoneTasksSetting.checked;
  const allTasks = document.querySelectorAll("li[checked]");
  allTasks.forEach((task) => {
    task.hidden = hide;
  });
  settings["hide-completed"] = hide;
  updateDatabase();
}

function populateFromLocalStorage() {
  taskData = JSON.parse(window.localStorage.getItem("tasks")) ?? taskData;
  settings = JSON.parse(window.localStorage.getItem("settings")) ?? settings;
}

function applySettings() {
  if (settings["hide-completed"]) {
    hideDoneTasksSetting.checked = true;
    hideTasks();
  }
}

function init() {
  populateFromLocalStorage();
  taskData.forEach((task) => {
    addTaskUI(task.taskName, task.id, task.checked, task.labels);
  });
  applySettings();
}

init();
