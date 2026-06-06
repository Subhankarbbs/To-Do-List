// --- DOM Elements ---
const addItem = document.getElementById('addItem')
const taskInput = document.getElementById('Task') // FIXED: Grabbing the textarea correctly
const taskList = document.getElementById('taskList')
const themeToggle = document.getElementById('themeToggle')

themeToggle.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark')
  if (document.documentElement.classList.contains('dark')) {
    themeToggle.textContent = 'Light Mode'
  } else {
    themeToggle.textContent = 'Dark Mode'
  }
})

addItem.addEventListener('submit', (e) => {
  e.preventDefault()

  const taskText = taskInput.value.trim()
  if (taskText === '') return

  const li = document.createElement('li')
  li.className =
    'flex items-center justify-between bg-white dark:bg-slate-700 p-4 rounded-lg border border-gray-200 dark:border-slate-600 shadow-sm mb-3 transition-colors'

  li.innerHTML = `
        <div class="flex items-center gap-3">
            <input
            type="checkbox"
            class="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer" />
            <span class="text-gray-800 dark:text-gray-100 text-lg transition-all duration-200">
              ${taskText}
            </span>
        </div>

        <button class="bg-red-500 hover:bg-red-600 text-white font-medium py-1.5 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-400">
            Delete
        </button>
    `

  taskList.appendChild(li)
  taskInput.value = ''
})

taskList.addEventListener('change', (e) => {
  // Check if the thing that changed was a checkbox
  if (e.target.type === 'checkbox') {
    const span = e.target.nextElementSibling
    if (e.target.checked) {
      span.classList.add('line-through', 'text-gray-400', 'opacity-60')
    } else {
      span.classList.remove('line-through', 'text-gray-400', 'opacity-60')
    }
  }
})

// --- 4. Event Delegation for Delete Buttons ---
taskList.addEventListener('click', (e) => {
  // Check if the click happened on or inside a button
  if (e.target.closest('button')) {
    e.preventDefault()
    const li = e.target.closest('li')
    li.remove()
  }
})
