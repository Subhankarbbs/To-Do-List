// --- DOM Elements ---
const addItem = document.getElementById('addItem')
const taskInput = document.getElementById('Task')
const taskList = document.getElementById('taskList')
const priorityInput = document.getElementById('taskPriority')
const dateInput = document.getElementById('taskDate')

// Task Modal Elements
const openModalBtn = document.getElementById('openModalBtn')
const closeModalBtn = document.getElementById('closeModalBtn')
const taskModal = document.getElementById('taskModal')

// Auth & Navbar Elements
const loggedOutNav = document.getElementById('loggedOutNav')
const loggedInNav = document.getElementById('loggedInNav')
const openLoginBtn = document.getElementById('openLoginBtn')
const openSignupBtn = document.getElementById('openSignupBtn')
const logoutBtn = document.getElementById('logoutBtn')
const themeToggle = document.getElementById('themeToggle')

// Auth Modal Elements
const authModal = document.getElementById('authModal')
const closeAuthModalBtn = document.getElementById('closeAuthModalBtn')
const authForm = document.getElementById('authForm')
const authModalTitle = document.getElementById('authModalTitle')
const authSubmitBtn = document.getElementById('authSubmitBtn')
const authModeInput = document.getElementById('authMode')

// Insights Elements
const statTotal = document.getElementById('statTotal')
const statCompleted = document.getElementById('statCompleted')
const statPending = document.getElementById('statPending')
const statPercent = document.getElementById('statPercent')
const progressBar = document.getElementById('progressBar')

// ==========================================
// --- SUPABASE INITIALIZATION ---
// ==========================================
const SUPABASE_URL = 'https://ksbjtqwyzzmvifcqvenv.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_gIlXeBmdCa_IJ7_K9E87IA_q2IFfI8w'

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
)

// --- Theme Toggle Logic ---
// 1. Check Local Storage immediately when the page loads
if (localStorage.getItem('theme') === 'dark') {
  document.documentElement.classList.add('dark')
  themeToggle.textContent = '☀️ Light'
} else {
  document.documentElement.classList.remove('dark')
  themeToggle.textContent = '🌙 Dark'
}

// 2. Listen for clicks and update Local Storage
themeToggle.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark')

  if (document.documentElement.classList.contains('dark')) {
    localStorage.setItem('theme', 'dark') // Save preference
    themeToggle.textContent = '☀️ Light'
  } else {
    localStorage.setItem('theme', 'light') // Save preference
    themeToggle.textContent = '🌙 Dark'
  }
})

// --- Modal UI Controls ---
openLoginBtn.addEventListener('click', () => {
  authModeInput.value = 'login'
  authModalTitle.textContent = 'Welcome Back'
  authSubmitBtn.textContent = 'Log In'
  authModal.classList.remove('hidden')
})

openSignupBtn.addEventListener('click', () => {
  authModeInput.value = 'signup'
  authModalTitle.textContent = 'Create an Account'
  authSubmitBtn.textContent = 'Sign Up'
  authModal.classList.remove('hidden')
})

closeAuthModalBtn.addEventListener('click', () => {
  authModal.classList.add('hidden')
})

openModalBtn.addEventListener('click', () => {
  taskModal.classList.remove('hidden')
  taskInput.focus()
})

closeModalBtn.addEventListener('click', () => {
  taskModal.classList.add('hidden')
})

// ==========================================
// --- AUTHENTICATION LOGIC ---
// ==========================================
authForm.addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = document.getElementById('authEmail').value
  const password = document.getElementById('authPassword').value
  const mode = authModeInput.value

  authSubmitBtn.textContent = 'Please wait...'
  authSubmitBtn.disabled = true

  let error = null

  if (mode === 'signup') {
    const { error: signUpError } = await supabaseClient.auth.signUp({
      email,
      password,
    })
    error = signUpError
  } else {
    const { error: signInError } = await supabaseClient.auth.signInWithPassword(
      { email, password },
    )
    error = signInError
  }

  authSubmitBtn.disabled = false
  authSubmitBtn.textContent = mode === 'signup' ? 'Sign Up' : 'Log In'

  if (error) {
    alert(error.message)
  } else {
    authModal.classList.add('hidden')
    authForm.reset()
    checkUser()
  }
})

logoutBtn.addEventListener('click', async () => {
  await supabaseClient.auth.signOut()
  checkUser()
})

async function checkUser() {
  const {
    data: { user },
  } = await supabaseClient.auth.getUser()

  if (user) {
    loggedOutNav.classList.add('hidden')
    loggedInNav.classList.remove('hidden')
    document.getElementById('userAccountName').textContent =
      user.email.split('@')[0]

    // NEW: User is logged in, fetch their specific tasks!
    fetchTasks()
  } else {
    loggedInNav.classList.add('hidden')
    loggedOutNav.classList.remove('hidden')

    // NEW: User logged out, clear the screen
    taskList.innerHTML = ''
    updateInsights()
  }
}

// ==========================================
// --- DATABASE LOGIC (CRUD) ---
// ==========================================

// 1. READ: Fetch tasks from the database
async function fetchTasks() {
  taskList.innerHTML = '' // Clear list

  const { data, error } = await supabaseClient
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching tasks:', error.message)
    return
  }

  if (data) {
    data.forEach((task) => renderTaskToScreen(task))
  }
  updateInsights()
}

// Helper Function: Draws a task to the HTML screen
function renderTaskToScreen(task) {
  let badgeColors = ''
  if (task.priority === 'High') {
    badgeColors =
      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800'
  } else if (task.priority === 'Medium') {
    badgeColors =
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800'
  } else {
    badgeColors =
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800'
  }

  const dateHtml = task.due_date
    ? `<div class="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">🗓️ Due: ${task.due_date}</div>`
    : ''

  const li = document.createElement('li')
  li.className =
    'flex items-center justify-between bg-white dark:bg-slate-700 p-4 rounded-lg border border-gray-200 dark:border-slate-600 shadow-sm transition-colors group'

  // CRITICAL: Attach Database ID so we can update/delete it later
  li.dataset.id = task.id

  const textClasses = task.completed
    ? 'task-text text-gray-800 dark:text-gray-100 text-lg transition-all duration-200 line-through text-gray-400 opacity-50'
    : 'task-text text-gray-800 dark:text-gray-100 text-lg transition-all duration-200'

  li.innerHTML = `
        <div class="flex items-start gap-3 flex-1">
            <input
            type="checkbox"
            ${task.completed ? 'checked' : ''}
            class="mt-1 w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer transition-transform hover:scale-110" />
            
            <div class="flex flex-col flex-1">
              <div class="flex items-center gap-3">
                <span class="${textClasses}">
                  ${task.task_text}
                </span>
                <span class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${badgeColors}">
                  ${task.priority}
                </span>
              </div>
              ${dateHtml}
            </div>
        </div>
        <button class="bg-red-500 hover:bg-red-600 text-white font-medium py-1.5 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 ml-2">
            Delete
        </button>
    `
  taskList.appendChild(li)
}

// 2. CREATE: Save Task to Database
addItem.addEventListener('submit', async (e) => {
  e.preventDefault()

  const textVal = taskInput.value.trim()
  if (textVal === '') return

  const priorityVal = priorityInput.value
  const dueDateVal = dateInput.value
  const addBtn = document.getElementById('addBtn')

  // Show loading state
  addBtn.value = 'Saving...'
  addBtn.disabled = true

  // Send to Supabase Database
  const { data, error } = await supabaseClient
    .from('tasks')
    .insert([
      {
        task_text: textVal,
        priority: priorityVal,
        due_date: dueDateVal,
        completed: false,
      },
    ])
    .select()

  // Restore Button
  addBtn.value = 'Save Task'
  addBtn.disabled = false

  if (error) {
    alert('Error saving task: ' + error.message)
    return
  }

  // Draw the returned task to the screen
  if (data && data.length > 0) {
    renderTaskToScreen(data[0])
  }

  // Clear Form
  taskInput.value = ''
  priorityInput.value = 'Low'
  dateInput.value = ''
  taskModal.classList.add('hidden')
  updateInsights()
})

// 3. UPDATE: Checkbox Change
taskList.addEventListener('change', async (e) => {
  if (e.target.type === 'checkbox') {
    const li = e.target.closest('li')
    const taskId = li.dataset.id
    const isChecked = e.target.checked
    const span = e.target.nextElementSibling.querySelector('.task-text')

    if (isChecked) {
      span.classList.add('line-through', 'text-gray-400', 'opacity-50')
    } else {
      span.classList.remove('line-through', 'text-gray-400', 'opacity-50')
    }
    updateInsights()

    // Tell database we completed the task
    const { error } = await supabaseClient
      .from('tasks')
      .update({ completed: isChecked })
      .eq('id', taskId)

    if (error) console.error('Error updating:', error)
  }
})

// 4. DELETE: Button Click
taskList.addEventListener('click', async (e) => {
  if (e.target.closest('button')) {
    e.preventDefault()

    const li = e.target.closest('li')
    const taskId = li.dataset.id

    li.remove()
    updateInsights()

    // Tell database to delete the task
    const { error } = await supabaseClient
      .from('tasks')
      .delete()
      .eq('id', taskId)

    if (error) console.error('Error deleting:', error)
  }
})

// --- Insights Logic ---
function updateInsights() {
  const total = taskList.children.length
  const completed = taskList.querySelectorAll(
    'input[type="checkbox"]:checked',
  ).length
  const pending = total - completed
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)

  statTotal.textContent = total
  statCompleted.textContent = completed
  statPending.textContent = pending
  statPercent.textContent = percent + '%'

  progressBar.style.width = percent + '%'

  if (percent === 100 && total > 0) {
    progressBar.classList.remove('bg-blue-600')
    progressBar.classList.add('bg-green-500')
  } else {
    progressBar.classList.remove('bg-green-500')
    progressBar.classList.add('bg-blue-600')
  }
}

// Start everything up!
checkUser()
