// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
// Notice: We no longer import './App.css' because we are using Tailwind CSS directly in our JSX.

function App() {
  // State variables to manage our application data and UI state
  const [tasks, setTasks] = useState([]); // Stores the list of tasks fetched from the backend
  const [newTaskTitle, setNewTaskTitle] = useState(''); // Holds the value for the new task title input
  const [newTaskDescription, setNewTaskDescription] = useState(''); // Holds the value for the new task description input
  const [editingTask, setEditingTask] = useState(null); // Stores the task object currently being edited (null if not editing)

  // The URL for our backend API endpoints
  const API_URL = 'react-node-tailwind-crud.railway.internal';

  // --- R (Read): Fetch Tasks from the Backend ---
  // useEffect hook runs side effects (like data fetching) after rendering.
  // The empty dependency array `[]` means this effect runs only once after the initial render.
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch(API_URL); // Send a GET request to our backend
      if (!response.ok) { // Check if the HTTP response status is successful (2xx)
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json(); // Parse the JSON response body into a JavaScript object
      setTasks(data); // Update the tasks state with the fetched data
    } catch (error) {
      console.error('Error fetching tasks:', error);
      // In a real app, you might show a user-friendly error message here
    }
  };

  // --- C (Create): Add a New Task ---
  const handleAddTask = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior (page reload)
    if (!newTaskTitle.trim()) { // Basic validation: ensure title is not empty or just whitespace
      alert('Task title cannot be empty!');
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST', // Specify the POST method for creating
        headers: {
          'Content-Type': 'application/json', // Tell the server we're sending JSON
        },
        body: JSON.stringify({ title: newTaskTitle, description: newTaskDescription }), // Send data as JSON string
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const addedTask = await response.json(); // Get the newly created task (with its ID from the backend)
      setTasks([...tasks, addedTask]); // Add the new task to our local state (immutably)
      setNewTaskTitle(''); // Clear the input field
      setNewTaskDescription(''); // Clear the description field
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  // --- U (Update): Toggle Task Completion Status ---
  const handleToggleComplete = async (id) => {
    const taskToToggle = tasks.find(task => task.id === id); // Find the task in our current state
    if (!taskToToggle) return; // Should not happen if UI is correctly rendered

    try {
      const response = await fetch(`${API_URL}/${id}`, { // PUT request to specific task ID
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send only the `completed` status change
        body: JSON.stringify({ completed: !taskToToggle.completed }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const updatedTask = await response.json(); // Get the updated task from the backend
      // Update the task in our local state: map over tasks and replace the one with matching ID
      setTasks(tasks.map(task => (task.id === id ? updatedTask : task)));
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  // --- U (Update): Prepare to Edit a Task ---
  const handleEditClick = (task) => {
    setEditingTask(task); // Set the task to be edited in state
    setNewTaskTitle(task.title); // Populate the form with the current task's title
    setNewTaskDescription(task.description); // Populate the form with the current task's description
  };

  // --- U (Update): Submit Edited Task ---
  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !editingTask) { // Validate and ensure we are in editing mode
        alert('Task title cannot be empty or no task selected for edit!');
        return;
    }

    try {
      const response = await fetch(`${API_URL}/${editingTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send updated title and description
        body: JSON.stringify({ title: newTaskTitle, description: newTaskDescription }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const updatedTask = await response.json();
      // Update the task in our local state
      setTasks(tasks.map(task => (task.id === editingTask.id ? updatedTask : task)));
      setEditingTask(null); // Exit editing mode
      setNewTaskTitle(''); // Clear form
      setNewTaskDescription(''); // Clear form
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // --- D (Delete): Delete a Task ---
  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
        return; // Ask for confirmation before deleting
    }
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE', // DELETE request to specific task ID
      });
      if (!response.ok) {
        // A 204 No Content is also a successful response for DELETE, so check specifically for errors
        if (response.status === 404) {
            throw new Error('Task not found.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Remove the deleted task from our local state
      setTasks(tasks.filter(task => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    // Main container for the app, uses Tailwind for full height, background color,
    // and centering content with flexbox.
    <div className="min-h-screen bg-gray-100 flex justify-center items-start py-10 px-4">
      {/* Main content wrapper, styled with white background, padding, rounded corners, and shadow */}
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-xl">
        {/* Page title */}
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">Task Manager</h1>

        {/* Task input/edit form */}
        <form onSubmit={editingTask ? handleUpdateTask : handleAddTask} className="flex flex-col gap-4 mb-8">
          {/* Task Title Input */}
          <input
            type="text"
            placeholder="Task Title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="p-3 border border-gray-300 rounded-md text-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required // HTML5 validation for required field
          />
          {/* Task Description Textarea */}
          <textarea
            placeholder="Task Description (optional)"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            className="p-3 border border-gray-300 rounded-md text-lg resize-y
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="3" // Initial height
          ></textarea>
          {/* Submit Button (Add/Update) */}
          <button
            type="submit"
            className="py-3 px-6 bg-blue-600 text-white font-semibold text-lg rounded-md
                       hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                       transition-colors duration-200"
          >
            {editingTask ? 'Update Task' : 'Add Task'}
          </button>
          {/* Cancel Edit Button (only visible when editing) */}
          {editingTask && (
            <button
              type="button"
              onClick={() => { setEditingTask(null); setNewTaskTitle(''); setNewTaskDescription(''); }}
              className="py-3 px-6 bg-gray-500 text-white font-semibold text-lg rounded-md
                         hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
                         transition-colors duration-200"
            >
              Cancel Edit
            </button>
          )}
        </form>

        {/* Task List Display */}
        <div>
          {tasks.length === 0 ? (
            <p className="text-center text-gray-500 text-xl py-4">No tasks yet. Add a new one!</p>
          ) : (
            <ul className="space-y-4"> {/* Vertical spacing between list items */}
              {tasks.map((task) => (
                // Each task item, conditionally styled based on 'completed' status
                <li
                  key={task.id} // `key` is crucial for React to efficiently update lists
                  className={`flex justify-between items-center bg-gray-50 p-4 rounded-md shadow-sm border border-gray-200
                    ${task.completed ? 'bg-green-50 border-green-200 line-through text-gray-500 opacity-80' : ''}`
                  }
                >
                  {/* Task Info (Title and Description) */}
                  <div className="flex flex-col flex-grow mr-4">
                    <span className={`text-xl font-semibold ${task.completed ? 'text-green-700' : 'text-gray-800'}`}>
                        {task.title}
                    </span>
                    {task.description && (
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    )}
                  </div>
                  {/* Task Actions (Checkbox, Edit, Delete Buttons) */}
                  <div className="flex items-center space-x-3">
                    {/* Completion Checkbox */}
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleComplete(task.id)}
                      className="h-6 w-6 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                    />
                    {/* Edit Button */}
                    <button
                      onClick={() => handleEditClick(task)}
                      className="px-4 py-2 bg-yellow-500 text-white text-base font-semibold rounded-md
                                 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400
                                 transition-colors duration-200"
                    >
                      Edit
                    </button>
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="px-4 py-2 bg-red-600 text-white text-base font-semibold rounded-md
                                 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500
                                 transition-colors duration-200"
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