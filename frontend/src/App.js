import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [filter, setFilter] = useState("all");
  const [darkMode, setDarkMode] = useState(false);

  const API_URL = "http://localhost:8000/todos";

  // 🔄 Load tasks on page load
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = () => {
    fetch(`${API_URL}/`)
      .then((res) => res.json())
      .then((data) => setTodos(data))
      .catch((err) => console.error("Error fetching todos:", err));
  };

  // ➕ Add a new task
  const addTodo = () => {
    if (!newTask.trim()) return;
    fetch(`${API_URL}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTask, completed: false }),
    })
      .then((res) => res.json())
      .then((data) => {
        setTodos([...todos, data]);
        setNewTask("");
      });
  };

  // 🗑️ Delete a task
  const deleteTodo = (id) => {
    fetch(`${API_URL}/${id}`, { method: "DELETE" })
      .then(() => {
        setTodos(todos.filter((todo) => todo.id !== id));
      })
      .catch((err) => console.error("Delete error:", err));
  };

  // ✅ Toggle complete
  const toggleComplete = (todo) => {
    fetch(`http://localhost:8000/todos/${todo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: todo.title || "", // make sure title is not undefined
        completed: !todo.completed,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Update failed");
        return res.json();
      })
      .then((updated) => {
        setTodos((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        );
      })
      .catch((err) => {
        console.error("Error updating task:", err);
        alert("Something went wrong when updating the task.");
      });
  };
  

  // 🧹 Filter todos
  const filteredTodos = todos.filter((todo) => {
    if (filter === "completed") return todo.completed;
    if (filter === "pending") return !todo.completed;
    return true;
  });

  return (
    <div className={`App ${darkMode ? "dark" : "light"}`}>
      <h1>📝 To-Do List</h1>

      {/* 🌗 Dark Mode Toggle */}
      <button onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>

      {/* ➕ Add Todo */}
      <div>
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Enter a task"
        />
        <button onClick={addTodo}>Add</button>
      </div>

      {/* 🔍 Filter Buttons */}
      <div>
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("completed")}>Completed</button>
        <button onClick={() => setFilter("pending")}>Pending</button>
      </div>

      {/* 📋 Todo List */}
      <ul>
        {filteredTodos.map((todo) => (
          <li key={todo.id}>
            <span
              style={{
                textDecoration: todo.completed ? "line-through" : "none",
                cursor: "pointer",
              }}
              onClick={() => toggleComplete(todo)}
            >
              {todo.title}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>❌</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
