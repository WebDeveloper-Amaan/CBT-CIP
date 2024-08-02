    const todosHtml = document.querySelector("#todosHtml");
    const input = document.querySelector("#input");
    const addButton = document.querySelector("#addButton");
    const deleteAllButton = document.querySelector("#deleteAllButton");
    const showAllButton = document.querySelector("#showAllButton");
    const showCompletedButton = document.querySelector("#showCompletedButton");
    const showIncompleteButton = document.querySelector("#showIncompleteButton");
    const emptyImage = document.querySelector("#emptyImage");

    //To store todo list browser
    let todosJson = JSON.parse(localStorage.getItem("todos")) || [];
  
    function showTodos(filter = '') {
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
            <input type="checkbox" id="todo-${index}" ${todo.status === 'completed' ? 'checked' : ''} onchange="updateStatus(this)" data-index="${index}">
            <span class="todo-name ${todo.status === 'completed' ? 'checked' : ''}">${todo.name}</span>
            <span class="timestamp">${todo.timestamp}</span>
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
      showTodos();
    }
  
    input.addEventListener("keyup", e => {
      if (e.key === "Enter") {
        addTodo();
      }
    });
  
    addButton.addEventListener("click", addTodo);
  
    window.updateStatus = function(todo) {
      let index = todo.dataset.index;
      todosJson[index].status = todo.checked ? "completed" : "pending";
      localStorage.setItem("todos", JSON.stringify(todosJson));
      showTodos();
    }
  
    window.remove = function(todo) {
      const index = todo.dataset.index;
      todosJson.splice(index, 1);
      localStorage.setItem("todos", JSON.stringify(todosJson));
      showTodos();
    }
  
    deleteAllButton.addEventListener("click", () => {
      todosJson = [];
      localStorage.setItem("todos", JSON.stringify(todosJson));
      showTodos();
    });
  
    showAllButton.addEventListener("click", () => showTodos());
    showCompletedButton.addEventListener("click", () => showTodos('completed'));
    showIncompleteButton.addEventListener("click", () => showTodos('incomplete'));
  
    window.editTask = function(btn) {
      const index = btn.dataset.index;
      const updatedTaskText = prompt("Edit Task:", todosJson[index].name);
      if (updatedTaskText !== null && updatedTaskText.trim() !== "") {
        todosJson[index].name = updatedTaskText;
        localStorage.setItem("todos", JSON.stringify(todosJson));
        showTodos();
      }
    }
  
    showTodos();