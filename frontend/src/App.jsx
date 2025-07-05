// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
// No more App.css import here, all styling is with Tailwind

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [editingTask, setEditingTask] = useState(null); // Stores the task being edited

  const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000/api/tasks';

  // --- Read (Fetch Tasks) ---
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // --- Create (Add Task) ---
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTaskTitle, description: newTaskDescription }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const addedTask = await response.json();
      setTasks([...tasks, addedTask]);
      setNewTaskTitle('');
      setNewTaskDescription('');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  // --- Update (Toggle Completion, Edit Task) ---
  const handleToggleComplete = async (id) => {
    const taskToToggle = tasks.find(task => task.id === id);
    if (!taskToToggle) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !taskToToggle.completed }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const updatedTask = await response.json();
      setTasks(tasks.map(task => (task.id === id ? updatedTask : task)));
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  const handleEditClick = (task) => {
    setEditingTask(task);
    setNewTaskTitle(task.title); // Pre-fill the form with current task data
    setNewTaskDescription(task.description);
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !editingTask) return;

    try {
      const response = await fetch(`${API_URL}/${editingTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTaskTitle, description: newTaskDescription }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const updatedTask = await response.json();
      setTasks(tasks.map(task => (task.id === editingTask.id ? updatedTask : task)));
      setEditingTask(null); // Exit editing mode
      setNewTaskTitle('');
      setNewTaskDescription('');
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // --- Delete (Remove Task) ---
  const handleDeleteTask = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setTasks(tasks.filter(task => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start py-10">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Task Manager</h1>

        <form onSubmit={editingTask ? handleUpdateTask : handleAddTask} className="flex flex-col gap-4 mb-6">
          <input
            type="text"
            placeholder="Task Title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <textarea
            placeholder="Task Description (optional)"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            rows="3"
          ></textarea>
          <button
            type="submit"
            className="py-3 px-6 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            {editingTask ? 'Update Task' : 'Add Task'}
          </button>
          {editingTask && (
            <button
              type="button"
              onClick={() => { setEditingTask(null); setNewTaskTitle(''); setNewTaskDescription(''); }}
              className="py-3 px-6 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors duration-200"
            >
              Cancel Edit
            </button>
          )}
        </form>

        <div>
          {tasks.length === 0 ? (
            <p className="text-center text-gray-500 text-lg">No tasks yet. Add a new one!</p>
          ) : (
            <ul className="space-y-4">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className={`flex justify-between items-center bg-gray-50 p-4 rounded-md shadow-sm border border-gray-200
                    ${task.completed ? 'bg-green-50 border-green-200 line-through text-gray-500' : ''}`
                  }
                >
                  <div className="flex flex-col flex-grow mr-4">
                    <span className={`text-lg font-medium ${task.completed ? 'text-green-700' : 'text-gray-800'}`}>
                        {task.title}
                    </span>
                    {task.description && (
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleComplete(task.id)}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                    />
                    <button
                      onClick={() => handleEditClick(task)}
                      className="px-3 py-1 bg-yellow-500 text-white text-sm font-semibold rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm font-semibold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;