const todosHtml = document.querySelector("#todosHtml");
const input = document.querySelector("#input");
const addButton = document.querySelector("#addButton");
const deleteAllButton = document.querySelector("#deleteAllButton");
const showAllButton = document.querySelector("#showAllButton");
const showCompletedButton = document.querySelector("#showCompletedButton");
const showIncompleteButton = document.querySelector("#showIncompleteButton");
const emptyImage = document.querySelector("#emptyImage");

// Load todos from localStorage or initialize an empty array if none exist
let todosJson = JSON.parse(localStorage.getItem("todos")) || [];
let currentFilter = ''; // Track the current filter status (all, completed, incomplete)

// Function to display todos based on the filter
function showTodos(filter = '') {
  currentFilter = filter; // Set the current filter
  let filteredTodos = todosJson;
  
  // Apply the filter
  if (filter === 'completed') {
    filteredTodos = todosJson.filter(todo => todo.status === 'completed');
  } else if (filter === 'incomplete') {
    filteredTodos = todosJson.filter(todo => todo.status === 'pending');
  }
  
  // Update the UI based on the filtered todos
  if (filteredTodos.length === 0) {
    todosHtml.innerHTML = '';
    emptyImage.style.display = 'block'; // Show empty image if no todos
  } else {
    todosHtml.innerHTML = filteredTodos.map((todo, index) => getTodoHtml(todo, index)).join('');
    emptyImage.style.display = 'none'; // Hide empty image if todos are present
  }
}

// Generate HTML for a todo item
function getTodoHtml(todo, index) {
  return `
    <li>
      <div class="todo-details">
        <label for="todo-${index}">
          <input 
            type="checkbox" 
            id="todo-${index}" 
            ${todo.status === 'completed' ? 'checked' : ''} 
            onchange="updateStatus(this)" 
            data-index="${index}"
          >
          <span class="todo-name ${todo.status === 'completed' ? 'checked' : ''}">${todo.name}</span>
        </label>
        <span class="timestamp">Added on: ${todo.timestamp}</span>
      </div>
      <button class="edit" onclick="editTask(this)" data-index="${index}"><i class="fa-regular fa-pen-to-square"></i>Edit</button>
      <button class="remove" onclick="remove(this)" data-index="${index}"><i class="fa-solid fa-text-slash"></i> Remove</button>
    </li>
  `;
}

// Format date as day/month/year hh:mm:ss
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`; // Format as dd/mm/yyyy hh:mm:ss
}

// Add a new todo item
function addTodo() {
  let todo = input.value.trim();
  if (!todo) {
    alert("Add some text in your input!"); // Alert if input is empty
    return;
  }

  const timestamp = formatDate(new Date()); // Get formatted timestamp
  todosJson.unshift({ name: todo, status: "pending", timestamp: timestamp });
  localStorage.setItem("todos", JSON.stringify(todosJson)); // Save todos to localStorage
  input.value = ""; // Clear input field
  showTodos(currentFilter); // Refresh the todo list
}

// Handle Enter key to add todo
input.addEventListener("keyup", e => {
  if (e.key === "Enter") {
    addTodo();
  }
});

// Handle keydown events for special functionality
document.addEventListener("keydown", e => {
  if (e.key === "/" && document.activeElement !== input) {
    e.preventDefault();  // Prevent default action of the forward slash key
    input.focus(); // Focus on the input field
  } else if (document.activeElement !== input) {
    showJumpToSearchMessage(); // Show message if not focusing on input
  }
});

// Add event listener to Add button
addButton.addEventListener("click", addTodo);

// Update the status of a todo item (completed or pending)
window.updateStatus = function(todo) {
  let index = todo.dataset.index;
  let filteredTodos = getFilteredTodos();
  let originalIndex = todosJson.indexOf(filteredTodos[index]);
  todosJson[originalIndex].status = todo.checked ? "completed" : "pending";
  localStorage.setItem("todos", JSON.stringify(todosJson)); // Save updated todos to localStorage
  showTodos(currentFilter); // Refresh the todo list
}

// Remove a todo item
window.remove = function(todo) {
  const index = parseInt(todo.dataset.index);
  let filteredTodos = getFilteredTodos();
  const originalIndex = todosJson.indexOf(filteredTodos[index]);
  todosJson.splice(originalIndex, 1); // Remove item from array
  localStorage.setItem("todos", JSON.stringify(todosJson)); // Save updated todos to localStorage
  showTodos(currentFilter); // Refresh the todo list
}

// Delete all todo items
deleteAllButton.addEventListener("click", () => {
  todosJson = [];
  localStorage.setItem("todos", JSON.stringify(todosJson)); // Clear localStorage
  showTodos(currentFilter); // Refresh the todo list
});

// Show all todos
showAllButton.addEventListener("click", () => showTodos());
// Show completed todos
showCompletedButton.addEventListener("click", () => showTodos('completed'));
// Show incomplete todos
showIncompleteButton.addEventListener("click", () => showTodos('incomplete'));

// Edit a todo item
window.editTask = function(btn) {
  const index = btn.dataset.index;
  let filteredTodos = getFilteredTodos();
  const originalIndex = todosJson.indexOf(filteredTodos[index]);
  const updatedTaskText = prompt("Edit Task:", todosJson[originalIndex].name);
  if (updatedTaskText !== null && updatedTaskText.trim() !== "") {
    todosJson[originalIndex].name = updatedTaskText;
    localStorage.setItem("todos", JSON.stringify(todosJson)); // Save updated todos to localStorage
    showTodos(currentFilter); // Refresh the todo list
  }
}

// Get filtered todos based on the current filter
function getFilteredTodos() {
  if (currentFilter === 'completed') {
    return todosJson.filter(todo => todo.status === 'completed');
  } else if (currentFilter === 'incomplete') {
    return todosJson.filter(todo => todo.status === 'pending');
  } else {
    return todosJson; // No filter applied
  }
}

// Show a message prompting to jump to the search box
function showJumpToSearchMessage() {
  const messageDiv = document.createElement('div');
  messageDiv.textContent = 'Press / to jump to the search box.';
  messageDiv.style.position = 'fixed';
  messageDiv.style.bottom = '10px';
  messageDiv.style.right = '10px';
  messageDiv.style.backgroundColor = '#222';
  messageDiv.style.color = '#fff';
  messageDiv.style.padding = '10px';
  messageDiv.style.borderRadius = '5px';
  messageDiv.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
  messageDiv.style.zIndex = '1000';
  document.body.appendChild(messageDiv);
  setTimeout(() => {
    document.body.removeChild(messageDiv); // Remove the message after 3 seconds
  }, 3000);
}

// Initial display of todos
showTodos();