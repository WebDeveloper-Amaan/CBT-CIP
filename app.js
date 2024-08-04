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
        <span class="timestamp">Add on= ${todo.timestamp}</span>
      </div>
      <button class="edit" onclick="editTask(this)" data-index="${index}"><i class="fa-regular fa-pen-to-square"></i>Edit</button>
      <button class="remove" onclick="remove(this)" data-index="${index}"><i class="fa-solid fa-text-slash"></i> Remove</button>
    </li>
  `;
}

function addTodo() {
  let todo = input.value.trim();
  if (!todo) return;

  const timestamp = new Date().toLocaleString();
  todosJson.unshift({ name: todo, status: "pending", timestamp: timestamp });
  localStorage.setItem("todos", JSON.stringify(todosJson));
  input.value = "";
  showTodos(currentFilter);
}

input.addEventListener("keyup", e => {
  if (e.key === "Enter") {
    addTodo();
  }
});

document.addEventListener("keydown", e => {
  if (e.key === "/") {
    e.preventDefault();  // Prevent default action of the forward slash key
    input.focus();
  } else if (document.activeElement !== input) {
    showJumpToSearchMessage();
  }
});

addButton.addEventListener("click", addTodo);

window.updateStatus = function(todo) {
  let index = todo.dataset.index;
  let filteredTodos = getFilteredTodos();
  let originalIndex = todosJson.indexOf(filteredTodos[index]);
  todosJson[originalIndex].status = todo.checked ? "completed" : "pending";
  localStorage.setItem("todos", JSON.stringify(todosJson));
  showTodos(currentFilter);
}

window.remove = function(todo) {
  const index = parseInt(todo.dataset.index);
  let filteredTodos = getFilteredTodos();
  const originalIndex = todosJson.indexOf(filteredTodos[index]);
  todosJson.splice(originalIndex, 1);
  localStorage.setItem("todos", JSON.stringify(todosJson));
  showTodos(currentFilter);
}

deleteAllButton.addEventListener("click", () => {
  todosJson = [];
  localStorage.setItem("todos", JSON.stringify(todosJson));
  showTodos(currentFilter);
});

showAllButton.addEventListener("click", () => showTodos());
showCompletedButton.addEventListener("click", () => showTodos('completed'));
showIncompleteButton.addEventListener("click", () => showTodos('incomplete'));

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

function getFilteredTodos() {
  if (currentFilter === 'completed') {
    return todosJson.filter(todo => todo.status === 'completed');
  } else if (currentFilter === 'incomplete') {
    return todosJson.filter(todo => todo.status === 'pending');
  } else {
    return todosJson;
  }
}

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

showTodos();