import { useState, useEffect, useRef } from 'react';
import './index.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, taskId: null });
  const [section, setSection] = useState('My Day');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [originalText, setOriginalText] = useState('');
  const tasksCompleteSound = new Audio('sounds/task-complete.mp3');
  const menuRef = useRef();

useEffect(() => {
  const handleClickOutside = (e) => {
    if (contextMenu.visible && menuRef.current && !menuRef.current.contains(e.target)) {
      setContextMenu({ ...contextMenu, visible: false });
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [contextMenu.visible]);

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

useEffect(() => {
  let timer;
  if (showAlert) {
    timer = setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  }
  return () => clearTimeout(timer);
}, [showAlert]);

  const addTask = async () => {
    if (input.trim()) {
      const response = await fetch('http://localhost:3001/todos/',{
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: input })
    });
      if (response.ok && input.length <= 100) {
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

  const editTask = async (id, newText) => {
    const response = await fetch(`http://localhost:3001/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newText })
    });
    if (response.ok) {
      const updatedTask = await response.json();
      setTasks(tasks.map(t => t._id === id ? updatedTask : t));
      setEditingId(null);
      setEditText('');
    } else {
      console.error('Failed to edit task');
    }
  }

  return (
    <div className="todo-app">
      <aside className="sidebar">
        <h2>To Do</h2>
        <nav>
          <ul>
            <li className={section === 'My Day' ? 'active' : ' '}
              onClick={() => setSection('My Day')}>My Day</li>
            <li className={section === 'Important' ? 'active' : ' '}
              onClick={() => setSection('Important')}>Important</li>
            <li className={section === 'Completed' ? 'active' : ' '}
              onClick={() => setSection('Completed')}>Completed</li>
          </ul>
            <div className="progress-bar">
            <div className="progress" 
            style={{
              width: `${tasks.length > 0 ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0}%`
        }}
      ></div>
          </div>
        </nav>
      </aside>
      <div className="main-section">
        <header className="main-header">
          <div>
            <h1>{section}</h1>
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
            className={`add-task-input${input.length > 100 ? ' input-error' : ''}`}
            type="text"
            placeholder="Add a task"
            value={input}
            onChange={e => {
              setInput(e.target.value);
              fetchSuggestions(e.target.value);
            }}
            onKeyDown={e => e.key === 'Enter' && addTask()}
          />
          <button className="add-task-btn" onClick={addTask}>+</button>
        </div>
        <ul className="task-list">
          { contextMenu.visible && (
            <div
              ref={menuRef}
              className="context-menu"
              style={{ top: contextMenu.y, left: contextMenu.x }}
              onMouseLeave={() => setContextMenu({ ...contextMenu, visible: false })}
            >
              <div className="context-menu-item"
                style={{ cursor: 'pointer', marginBottom: '5px' }}
                onClick={() => {
                  setEditingId(contextMenu.taskId);
                  const task = tasks.find(t => t._id === contextMenu.taskId);
                  setEditText(task ? task.text : '');
                  setOriginalText(task ? task.text : '');
                  setContextMenu({ ...contextMenu, visible: false });                 
              }}
                >
                  📝 Edit Task
                </div>
              <div className="context-menu-item"
                style={{ cursor: 'pointer', marginBottom: '5px' }}
                onClick={() => {
                  const task = tasks.find(t => t._id === contextMenu.taskId);
                  if (task) {
                    if(!task.completed && tasks.filter(t => t.completed).length +1 === tasks.length) {
                      tasksCompleteSound.play();
                      setShowAlert(true);
                    }
                    const updatedTask = { ...task, completed: !task.completed };
                    setTasks(tasks.map(t => t._id === task._id ? updatedTask : t));
                    fetch(`http://localhost:3001/todos/${task._id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ completed: updatedTask.completed })
                    });

                  }
                  setContextMenu({ ...contextMenu, visible: false, });
                }}
              >
                {(() => {
                  const task = tasks.find(t => t._id === contextMenu.taskId);
                  return task && task.completed ? '✅ Unmark as Completed' : '✅ Mark as Completed';
                })()}
              </div>
              <div className="context-menu-item"
                style={{ cursor: 'pointer', marginBottom: '5px' }}
                onClick={() => {
                  const task = tasks.find(t => t._id === contextMenu.taskId);
                  if (task) {
                    const updatedTask = { ...task, important: !task.important };
                    setTasks(tasks.map(t => t._id === task._id ? updatedTask : t));
                    fetch(`http://localhost:3001/todos/${task._id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ important: updatedTask.important })
                    });
                  }
                  setContextMenu({ ...contextMenu, visible: false });
                }}
              >
                {(() => {
                  const task = tasks.find(t => t._id === contextMenu.taskId);
                  return task && task.important ? '⭐Unmark as Important' : '⭐ Mark as Important';
                })()}
              </div>
              <div className="context-menu-item"
                style={{ cursor: 'pointer', color: 'red' }}
                onClick={() => {
                  deleteTask(contextMenu.taskId);
                  setContextMenu({ ...contextMenu, visible: false });
                }}
              >
                🗑️ Delete
              </div>
            </div>
          )}
          {tasks
            .filter(t => {
              if (section === 'Important') return t.important;
              if (section === 'Completed') return t.completed;
              return true; // My Day or all tasks
            })
            .filter(t => t.text.toLowerCase().includes(search.toLowerCase()))
            .map((task, i) => (
              <li key={i} className="task-item" onContextMenu={e => {
                e.preventDefault();
                setContextMenu({ visible: true, x: e.clientX, y: e.clientY, taskId: task._id });
              }}>
                <input type="checkbox"
                checked={task.completed}
                onChange={() => {
                  const updatedTask = { ...task, completed: !task.completed };
                  if(!task.completed && tasks.filter(t => t.completed).length +1 === tasks.length) {
                    tasksCompleteSound.play();
                    setShowAlert(true);
                  }
                  setTasks(tasks.map(t => t._id === task._id ? updatedTask : t));
                  fetch(`http://localhost:3001/todos/${task._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ completed: updatedTask.completed })
                  }); 
                }}
                />
               {editingId === task._id ? (
                <input
                  type="text"
                  className={`add-task-input${editText.length > 100 ? ' input-error' : ''}`}
                  value={editText}
                  autoFocus
                  onChange={e => setEditText(e.target.value)}
                  onBlur={() => {
                    if (editText.length > 100 || editText.trim() === '') {
                      setEditingId(null);
                      setEditText(originalText);
                    } else {
                      editTask(task._id, editText);
                      setEditText('');
                    }
                  }}
                  onKeyDown={e => {
                  if (e.key === 'Enter') {
                    if(editText.length > 100 || editText.trim() === '') {
                      setEditingId(null);
                      setEditText(originalText);
                    } else {
                      editTask(task._id, editText);
                      setEditText('');
                    }
                  } else if (e.key === 'Escape') {
                    setEditingId(null);
                    setEditText(originalText);
                }
              }}
            />
          ) : (
                <span
                  onDoubleClick={() => {
                    setEditingId(task._id);
                    setEditText(task.text);
                    setOriginalText(task.text);
                  }}
                >
                  {task.text}
                </span>           
              )}
                {task.important && <span className="important-icon">⭐</span>}
              </li>
            ))}
        </ul>
        <button
          onClick={showAlert ? () => setShowAlert(false) : () => setShowAlert(true)}
          className={`alert-btn ${showAlert ? 'active' : ''}`}
        >
          {showAlert ? 'All tasks are completed! 🎉' : ''}
        </button>
      </div>
    </div>
  );
}

export default App;
