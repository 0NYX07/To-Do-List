const taskInput = document.getElementById('taskInput');
const prioritySelect = document.getElementById('prioritySelect');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompleted');
const clearAllBtn = document.getElementById('clearAll');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notificationText');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('i');

const dingSound = document.getElementById('dingSound');
const addSound = document.getElementById('addSound');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

function init() {
  updateDate();
  renderTasks();
  setupEventListeners();
  loadTheme();
  showNotification('Welcome to Task Manager!', 'success');
}

function setupEventListeners() {
  addBtn.addEventListener('click', addTask);
  taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
  });
  
  clearCompletedBtn.addEventListener('click', clearCompleted);
  clearAllBtn.addEventListener('click', clearAll);
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      setFilter(filter);
    });
  });
  
  themeToggle.addEventListener('click', toggleTheme);
}

function toggleTheme() {
  document.body.classList.toggle('night-mode');
  
  if (document.body.classList.contains('night-mode')) {
    themeIcon.className = 'fas fa-sun';
    themeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    localStorage.setItem('theme', 'night');
  } else {
    themeIcon.className = 'fas fa-moon';
    themeToggle.innerHTML = '<i class="fas fa-moon"></i> Night Mode';
    localStorage.setItem('theme', 'light');
  }
}

function loadTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'night') {
    document.body.classList.add('night-mode');
    themeIcon.className = 'fas fa-sun';
    themeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
  }
}

function updateDate() {
  const dateDisplay = document.getElementById('dateDisplay');
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  dateDisplay.textContent = now.toLocaleDateString('en-US', options);
}

function addTask() {
  const text = taskInput.value.trim();
  if (!text) {
    showNotification('Please enter a task!', 'warning');
    return;
  }
  
  const task = {
    id: Date.now(),
    text: text,
    priority: prioritySelect.value,
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  tasks.unshift(task);
  saveTasks();
  renderTasks();
  taskInput.value = '';
  taskInput.focus();
  
  addSound.currentTime = 0;
  addSound.play().catch(e => console.log('Audio error:', e));
  
  showNotification('Task added successfully!', 'success');
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
    
    if (task.completed) {
      dingSound.currentTime = 0;
      dingSound.play().catch(e => console.log('Audio error:', e));
      showNotification('Task completed! 🎉', 'success');
    }
  }
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
  showNotification('Task deleted!', 'danger');
}

function clearCompleted() {
  const completedCount = tasks.filter(t => t.completed).length;
  if (completedCount === 0) {
    showNotification('No completed tasks to clear!', 'warning');
    return;
  }
  
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  renderTasks();
  showNotification(`Cleared ${completedCount} completed tasks!`, 'success');
}

function clearAll() {
  if (tasks.length === 0) {
    showNotification('No tasks to clear!', 'warning');
    return;
  }
  
  if (confirm('Are you sure you want to delete all tasks?')) {
    tasks = [];
    saveTasks();
    renderTasks();
    showNotification('All tasks cleared!', 'danger');
  }
}

function setFilter(filter) {
  currentFilter = filter;
  
  filterBtns.forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.filter === filter) {
      btn.classList.add('active');
    }
  });
  
  renderTasks();
}

function renderTasks() {
  let filteredTasks = tasks;
  if (currentFilter !== 'all') {
    filteredTasks = tasks.filter(task => task.priority === currentFilter);
  }
  
  updateStats();
  
  const emptyState = document.getElementById('emptyState');
  if (filteredTasks.length === 0) {
    emptyState.style.display = 'block';
    taskList.innerHTML = '';
    return;
  }
  emptyState.style.display = 'none';
  
  taskList.innerHTML = '';
  filteredTasks.forEach(task => {
    const taskItem = createTaskElement(task);
    taskList.appendChild(taskItem);
  });
}

function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = `task-item priority-${task.priority} ${task.completed ? 'completed' : ''}`;
  
  li.innerHTML = `
    <div class="task-checkbox ${task.completed ? 'checked' : ''}"></div>
    <div class="task-content">
      <span class="task-text">${task.text}</span>
      <span class="task-priority">${task.priority}</span>
    </div>
    <button class="delete-btn">
      <i class="fas fa-trash"></i>
    </button>
  `;
  
  const checkbox = li.querySelector('.task-checkbox');
  const deleteBtn = li.querySelector('.delete-btn');
  
  checkbox.addEventListener('click', () => toggleTask(task.id));
  deleteBtn.addEventListener('click', () => deleteTask(task.id));
  
  return li;
}

function updateStats() {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  
  document.getElementById('totalTasks').textContent = totalTasks;
  document.getElementById('completedTasks').textContent = completedTasks;
  document.getElementById('pendingTasks').textContent = pendingTasks;
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  updateStats();
}

function showNotification(message, type = 'success') {
  notificationText.textContent = message;
  
  const colors = {
    success: '#4cc9f0',
    warning: '#f8961e',
    danger: '#f72585'
  };
  notification.style.background = colors[type] || colors.success;
  
  notification.classList.add('show');
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

init();