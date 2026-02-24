const input = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const filterButtons = document.querySelectorAll(".filter-bar .filter-btn");
const emptyMessage = document.getElementById("emptyMessage");
const toggleTheme = document.getElementById("toggleTheme");
const clearCompletedBtn = document.getElementById("clearCompleted");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let activeFilter = "all";

function renderTasks(filter = activeFilter) {
  taskList.innerHTML = "";

  activeFilter = filter;
  // update active class on filter buttons
  filterButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.filter === filter));

  let filteredTasks = tasks;
  if (filter === "completed") filteredTasks = tasks.filter(t => t.completed);
  if (filter === "pending") filteredTasks = tasks.filter(t => !t.completed);

  // update counts on badges (All only)
  const allBtn = document.querySelector('.filter-btn[data-filter="all"]');
  if (allBtn) {
    const badge = allBtn.querySelector('.count-badge');
    if (badge) badge.textContent = tasks.length;
  }

  emptyMessage.style.display = filteredTasks.length === 0 ? 'block' : 'none';

  filteredTasks.forEach((task, i) => {
    // compute original index in tasks array
    const index = tasks.indexOf(task);

    const li = document.createElement('li');
    li.className = 'todo-item';

    const left = document.createElement('div');
    left.className = 'todo-left';

    const checkbox = document.createElement('button');
    checkbox.className = 'checkbox' + (task.completed ? ' checked' : '');
    checkbox.setAttribute('aria-pressed', task.completed);
    checkbox.title = 'Toggle complete';
    checkbox.addEventListener('click', () => { toggleComplete(index); });

    const checkSvg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    checkSvg.setAttribute('viewBox','0 0 24 24');
    checkSvg.innerHTML = '<path fill="none" stroke="white" stroke-width="3" d="M4 12l4 4 12-12" />';
    if (task.completed) checkSvg.style.opacity = '1';
    checkbox.appendChild(checkSvg);

    const text = document.createElement('div');
    text.className = 'todo-text' + (task.completed ? ' completed' : '');
    text.textContent = task.text;
    text.title = task.text;
    text.addEventListener('dblclick', () => editTask(index));

    left.appendChild(checkbox);
    left.appendChild(text);

    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'icon-btn';
    editBtn.innerText = '✏';
    editBtn.title = 'Edit';
    editBtn.addEventListener('click', () => editTask(index));

    const delBtn = document.createElement('button');
    delBtn.className = 'icon-btn';
    delBtn.innerText = '❌';
    delBtn.title = 'Delete';
    delBtn.addEventListener('click', () => deleteTask(index));

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    li.appendChild(left);
    li.appendChild(actions);
    taskList.appendChild(li);
  });
}

function addTask() {
  const val = input.value.trim();
  if (!val) return;
  tasks.push({ text: val, completed: false });
  input.value = '';
  saveTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
}

function toggleComplete(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
}

function editTask(index) {
  const newText = prompt('Edit task:', tasks[index].text);
  if (newText === null) return;
  tasks[index].text = newText.trim() || tasks[index].text;
  saveTasks();
}

function clearCompleted() {
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();
}

// wire up UI
addBtn.addEventListener('click', addTask);
// also allow pressing Enter in the input
input.addEventListener('keydown', (e) => { if (e.key === 'Enter') addTask(); });

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => renderTasks(btn.dataset.filter));
});

// Theme persistence and UI
function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
  updateThemeToggle();
}

function saveTheme(theme) { localStorage.setItem('theme', theme); }
function loadTheme() { return localStorage.getItem('theme') || 'light'; }

function updateThemeToggle() {
  if (!toggleTheme) return;
  const isDark = document.body.classList.contains('dark');
  toggleTheme.textContent = isDark ? '☀️' : '🌙';
  toggleTheme.setAttribute('aria-pressed', isDark);
}

// initialize theme
applyTheme(loadTheme());

if (toggleTheme) toggleTheme.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark');
  saveTheme(isDark ? 'dark' : 'light');
  updateThemeToggle();
});

if (clearCompletedBtn) clearCompletedBtn.addEventListener('click', clearCompleted);

renderTasks();