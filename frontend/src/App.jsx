// frontend/src/App.jsx
import { useState, useEffect } from 'react';
import './index.css';

// *** PAANO GUMAGANA ANG API_URL NA ITO: ***
// import.meta.env.VITE_APP_API_URL: Kukunin ang value nito mula sa Environment Variables.
//    - Kapag LOCAL DEVELOPMENT (npm run dev): Walang VITE_APP_API_URL na nakaset, kaya gagamitin ang 'http://localhost:5000/api/tasks'.
//    - Kapag VERCEL DEPLOYMENT: Kukunin ang VITE_APP_API_URL na IKAW MISMO ang magse-set sa Vercel Environment Variables.
//
// MAHALAGANG PAALALA TUNGKOL SA `react-node-tailwind-crud.railway.internal`:
// Ang URL na ito ay para sa INTERNAL communication LAMANG kung ang iyong frontend at backend ay PAREHONG
// naka-deploy sa PAREHONG Railway project. HINDI ITO GAGANA kung ang frontend mo ay nasa Vercel.
// Sa Vercel, kailangan mo ang PUBLIC domain ng iyong Railway backend (e.g., https://your-backend-name.up.railway.app).
const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000/api/tasks';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [editedTaskText, setEditedTaskText] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      // Maaari kang maglagay ng alert dito para sa user:
      // alert(`Failed to fetch tasks: ${error.message}. Make sure your backend server is running and accessible.`);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newTaskText }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      const newTask = await response.json();
      setTasks((prevTasks) => [...prevTasks, newTask]);
      setNewTaskText('');
    } catch (error) {
      console.error('Error adding task:', error);
      // alert(`Failed to add task: ${error.message}`);
    }
  };

  const startEdit = (task) => {
    setEditingTask(task.id);
    setEditedTaskText(task.text);
  };

  const saveEdit = async (taskId) => {
    try {
      const response = await fetch(`${API_URL}/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: editedTaskText }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      const updatedTask = await response.json();
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? updatedTask : task))
      );
      setEditingTask(null);
      setEditedTaskText('');
    } catch (error) {
      console.error('Error saving task:', error);
      // alert(`Failed to save task: ${error.message}`);
    }
  };

  const toggleComplete = async (taskId, currentCompletedStatus) => {
    try {
      const response = await fetch(`${API_URL}/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentCompletedStatus }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      const updatedTask = await response.json();
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? updatedTask : task))
      );
    } catch (error) {
      console.error('Error toggling task completion:', error);
      // alert(`Failed to toggle task: ${error.message}`);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const response = await fetch(`${API_URL}/${taskId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      // alert(`Failed to delete task: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Task Manager</h1>

        {/* Add Task Form */}
        <form onSubmit={addTask} className="flex gap-2 mb-6">
          <input
            type="text"
            className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add a new task..."
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Add Task
          </button>
        </form>

        {/* Task List */}
        {tasks.length === 0 ? (
          <p className="text-center text-gray-500">No tasks yet. Add one!</p>
        ) : (
          <ul className="space-y-4">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200"
              >
                {editingTask === task.id ? (
                  <input
                    type="text"
                    className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                    value={editedTaskText}
                    onChange={(e) => setEditedTaskText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') saveEdit(task.id);
                    }}
                  />
                ) : (
                  <span
                    className={`text-lg font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}
                  >
                    {task.text}
                  </span>
                )}

                <div className="flex items-center gap-2">
                  {editingTask === task.id ? (
                    <button
                      onClick={() => saveEdit(task.id)}
                      className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition duration-200 text-sm"
                      title="Save"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleComplete(task.id, task.completed)}
                      className={`p-2 rounded-full transition duration-200 text-sm ${task.completed ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                      title={task.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
                    >
                      {task.completed ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586l-1.293-1.293z" clipRule="evenodd" />
                          </svg>
                      ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => startEdit(task)}
                    className="bg-purple-500 text-white p-2 rounded-full hover:bg-purple-600 transition duration-200 text-sm"
                    title="Edit"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.38-2.827-2.828z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition duration-200 text-sm"
                    title="Delete"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm1 3a1 1 0 000 2h4a1 1 0 100-2H8z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;