// --- DOM Elements ---
const addItem = document.getElementById('addItem')
const taskInput = document.getElementById('Task')
const taskList = document.getElementById('taskList')
const themeToggle = document.getElementById('themeToggle')
const priorityInput = document.getElementById('taskPriority')
const dateInput = document.getElementById('taskDate')

// Modal Elements
const openModalBtn = document.getElementById('openModalBtn')
const closeModalBtn = document.getElementById('closeModalBtn')
const taskModal = document.getElementById('taskModal')

// Insights Elements
const statTotal = document.getElementById('statTotal')
const statCompleted = document.getElementById('statCompleted')
const statPending = document.getElementById('statPending')
const statPercent = document.getElementById('statPercent')
const progressBar = document.getElementById('progressBar')

// --- Insights Logic ---
function updateInsights() {
  const total = taskList.children.length
  const completed = taskList.querySelectorAll(
    'input[type="checkbox"]:checked',
  ).length
  const pending = total - completed
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)

  // Update text
  statTotal.textContent = total
  statCompleted.textContent = completed
  statPending.textContent = pending
  statPercent.textContent = percent + '%'

  // Update progress bar
  progressBar.style.width = percent + '%'

  if (percent === 100 && total > 0) {
    progressBar.classList.remove('bg-blue-600')
    progressBar.classList.add('bg-green-500')
  } else {
    progressBar.classList.remove('bg-green-500')
    progressBar.classList.add('bg-blue-600')
  }
}

// --- Theme Toggle Logic ---
themeToggle.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark')
  if (document.documentElement.classList.contains('dark')) {
    themeToggle.textContent = 'Light Mode'
  } else {
    themeToggle.textContent = 'Dark Mode'
  }
})

// --- Modal Controls ---
openModalBtn.addEventListener('click', () => {
  taskModal.classList.remove('hidden')
  taskInput.focus()
})

closeModalBtn.addEventListener('click', () => {
  taskModal.classList.add('hidden')
})

// Close modal when clicking outside the box
taskModal.addEventListener('click', (e) => {
  if (e.target === taskModal) {
    taskModal.classList.add('hidden')
  }
})

// --- Add Task Logic ---
addItem.addEventListener('submit', (e) => {
  e.preventDefault()

  const taskText = taskInput.value.trim()
  if (taskText === '') return

  const priority = priorityInput.value
  const dueDate = dateInput.value

  // Determine Badge Colors
  let badgeColors = ''
  if (priority === 'High') {
    badgeColors =
      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800'
  } else if (priority === 'Medium') {
    badgeColors =
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800'
  } else {
    badgeColors =
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800'
  }

  // Build Date HTML
  const dateHtml = dueDate
    ? `<div class="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">🗓️ Due: ${dueDate}</div>`
    : ''

  // Create Element
  const li = document.createElement('li')
  li.className =
    'flex items-center justify-between bg-white dark:bg-slate-700 p-4 rounded-lg border border-gray-200 dark:border-slate-600 shadow-sm transition-colors group'

  li.innerHTML = `
        <div class="flex items-start gap-3 flex-1">
            <input
            type="checkbox"
            class="mt-1 w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer transition-transform hover:scale-110" />
            
            <div class="flex flex-col flex-1">
              <div class="flex items-center gap-3">
                <span class="task-text text-gray-800 dark:text-gray-100 text-lg transition-all duration-200">
                  ${taskText}
                </span>
                <span class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${badgeColors}">
                  ${priority}
                </span>
              </div>
              ${dateHtml}
            </div>
        </div>

        <button class="bg-red-500 hover:bg-red-600 text-white font-medium py-1.5 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 ml-2">
            Delete
        </button>
    `

  // Append, Clear, Close, and Update
  taskList.appendChild(li)

  taskInput.value = ''
  priorityInput.value = 'Low'
  dateInput.value = ''

  taskModal.classList.add('hidden')
  updateInsights()
})

// --- Event Delegation: Checkbox ---
taskList.addEventListener('change', (e) => {
  if (e.target.type === 'checkbox') {
    const container = e.target.nextElementSibling
    const span = container.querySelector('.task-text')

    if (e.target.checked) {
      span.classList.add('line-through', 'text-gray-400', 'opacity-50')
    } else {
      span.classList.remove('line-through', 'text-gray-400', 'opacity-50')
    }

    // Update insights whenever a box is checked/unchecked
    updateInsights()
  }
})

// --- Event Delegation: Delete Button ---
taskList.addEventListener('click', (e) => {
  if (e.target.closest('button')) {
    e.preventDefault()
    const li = e.target.closest('li')
    li.remove()

    // Update insights whenever a task is deleted
    updateInsights()
  }
})

// Initialize insights on page load (starts at 0)
updateInsights()
