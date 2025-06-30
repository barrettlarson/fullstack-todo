import { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, taskId: null });

useEffect(() => {
  fetch('http://localhost:3001/todos')
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        setTasks(data);
      } else {
        setTasks([]);
        console.error('Expected array but got:', data);
      }
    })
    .catch(err => {
      setTasks([]);
      console.error('Fetch error:', err);
    });
}, []);

  const addTask = async () => {
    if (input.trim()) {
      const response = await fetch('http://localhost:3001/todos/',{
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: input })
    });
      if (response.ok) {
        const newTask = await response.json();
        setTasks([newTask, ...tasks]);
        setInput('');
      } else {
        console.error('Failed to add task');
      }
  }
};

  const deleteTask = async (id) => {
    const response = await fetch('http://localhost:3001/todos/' + id, {
      method: 'DELETE'
    });
    if (response.ok) {
      setTasks(tasks.filter(t => t._id !== id));
    } else {
      console.error('Failed to delete task');
    }
  }

  return (
    <div className="todo-app">
      <aside className="sidebar">
        <h2>To Do</h2>
        <nav>
          <ul>
            <li className="active">My Day</li>
            <li>Important</li>
            <li>Planned</li>
            <li>Tasks</li>
          </ul>
        </nav>
      </aside>
      <div className="main-section">
        <header className="main-header">
          <div>
            <h1>My Day</h1>
            <span className="date">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>
          <input
            className="search-bar"
            type="text"
            placeholder="Search"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </header>
        <div className="add-task-row">
          <input
            className="add-task-input"
            type="text"
            placeholder="Add a task"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTask()}
          />
          <button className="add-task-btn" onClick={addTask}>+</button>
        </div>
        <ul className="task-list">
          { contextMenu.visible && (
            <div
              className="context-menu"
              style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, zIndex: 1000 }}
              onClick={() => {
                deleteTask(contextMenu.taskId);
                setContextMenu({ ...contextMenu, visible: false });
              }}
            >
              Delete
            </div>
          )}
          {tasks
            .filter(t => t.text.toLowerCase().includes(search.toLowerCase()))
            .map((task, i) => (
              <li key={i} className="task-item" onContextMenu={e => {
                e.preventDefault();
                setContextMenu({ visible: true, x: e.clientX, y: e.clientY, taskId: task._id });
              }}>
                <input type="checkbox" />
                <span>{task.text}</span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
