const todosHtml = document.querySelector("#todosHtml");
const input = document.querySelector("#input");
const addButton = document.querySelector("#addButton");
const deleteAllButton = document.querySelector("#deleteAllButton");
const showAllButton = document.querySelector("#showAllButton");
const showCompletedButton = document.querySelector("#showCompletedButton");
const showIncompleteButton = document.querySelector("#showIncompleteButton");
const emptyImage = document.querySelector("#emptyImage");

let todosJson = JSON.parse(localStorage.getItem("todos")) || [];
let currentFilter = '';

// Function to display todos based on the current filter
function showTodos(filter = '') {
  currentFilter = filter;
  let filteredTodos = todosJson;
  if (filter === 'completed') {
    filteredTodos = todosJson.filter(todo => todo.status === 'completed');
  } else if (filter === 'incomplete') {
    filteredTodos = todosJson.filter(todo => todo.status === 'pending');
  }
  if (filteredTodos.length === 0) {
    todosHtml.innerHTML = '';
    emptyImage.style.display = 'block';
  } else {
    todosHtml.innerHTML = filteredTodos.map((todo, index) => getTodoHtml(todo, index)).join('');
    emptyImage.style.display = 'none';
  }
}

// Function to generate HTML for a todo item
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

// Function to format the date and time with AM/PM
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds} ${ampm}`; // Format as dd/mm/yyyy hh:mm:ss AM/PM
}

// Function to add a new todo
function addTodo() {
  let todo = input.value.trim();
  if (!todo) {
    alert("Add some text in your input!");
    return;
  }

  const timestamp = formatDate(new Date()); // Use the new format
  todosJson.unshift({ name: todo, status: "pending", timestamp: timestamp });
  localStorage.setItem("todos", JSON.stringify(todosJson));
  input.value = "";
  showTodos(currentFilter);
}

// Event listener for the Enter key to add a todo
input.addEventListener("keyup", e => {
  if (e.key === "Enter") {
    addTodo();
  }
});

// Event listener for the / key to focus on the input
document.addEventListener("keydown", e => {
  if (e.key === "/" && document.activeElement !== input) {
    e.preventDefault();  // Prevent default action of the forward slash key
    input.focus();
  } else if (document.activeElement !== input) {
    showJumpToSearchMessage();
  }
});

// Event listener for the Add button to add a todo
addButton.addEventListener("click", addTodo);

// Function to update the status of a todo
window.updateStatus = function(todo) {
  let index = todo.dataset.index;
  let filteredTodos = getFilteredTodos();
  let originalIndex = todosJson.indexOf(filteredTodos[index]);
  todosJson[originalIndex].status = todo.checked ? "completed" : "pending";
  localStorage.setItem("todos", JSON.stringify(todosJson));
  showTodos(currentFilter);
}

// Function to remove a todo
window.remove = function(todo) {
  const index = parseInt(todo.dataset.index);
  let filteredTodos = getFilteredTodos();
  const originalIndex = todosJson.indexOf(filteredTodos[index]);
  todosJson.splice(originalIndex, 1);
  localStorage.setItem("todos", JSON.stringify(todosJson));
  showTodos(currentFilter);
}

// Event listener for the Delete All button to remove all todos
deleteAllButton.addEventListener("click", () => {
  todosJson = [];
  localStorage.setItem("todos", JSON.stringify(todosJson));
  showTodos(currentFilter);
});

// Event listeners for the filter buttons
showAllButton.addEventListener("click", () => showTodos());
showCompletedButton.addEventListener("click", () => showTodos('completed'));
showIncompleteButton.addEventListener("click", () => showTodos('incomplete'));

// Function to edit a todo
window.editTask = function(btn) {
  const index = btn.dataset.index;
  let filteredTodos = getFilteredTodos();
  const originalIndex = todosJson.indexOf(filteredTodos[index]);
  const updatedTaskText = prompt("Edit Task:", todosJson[originalIndex].name);
  if (updatedTaskText !== null && updatedTaskText.trim() !== "") {
    todosJson[originalIndex].name = updatedTaskText;
    localStorage.setItem("todos", JSON.stringify(todosJson));
    showTodos(currentFilter);
  }
}

// Function to get filtered todos based on the current filter
function getFilteredTodos() {
  if (currentFilter === 'completed') {
    return todosJson.filter(todo => todo.status === 'completed');
  } else if (currentFilter === 'incomplete') {
    return todosJson.filter(todo => todo.status === 'pending');
  } else {
    return todosJson;
  }
}

// Function to show a message for the forward slash key shortcut
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
    document.body.removeChild(messageDiv);
  }, 3000);
}

// Display todos on page load
showTodos();
