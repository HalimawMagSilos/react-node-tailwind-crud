// backend/server.js

// 1. Import necessary modules
import express from 'express'; // Our web framework
import cors from 'cors';       // For Cross-Origin Resource Sharing
import fs from 'fs/promises';  // Node.js file system module for async file operations
import path from 'path';       // Node.js path module for resolving file paths
import { fileURLToPath } from 'url'; // Utility to get __dirname in ES Modules

// 2. Initialize the Express application
const app = express();
const PORT = process.env.PORT || 5000; // Use port from environment variable, or default to 5000 locally // Define the port your backend server will listen on

// 3. Setup paths for file-based "database"
// In ES Modules (__dirname is not directly available), so we derive it
const __filename = fileURLToPath(import.meta.url); // Gets the current file's URL
const __dirname = path.dirname(__filename);       // Gets the directory name of the current file
const DB_FILE = path.join('/var/data', 'tasks.json'); // Path to our JSON file database

// 4. Middleware: Functions that run before your routes
app.use(cors()); // Enables CORS for all incoming requests, allowing your frontend to connect
app.use(express.json()); // Parses incoming request bodies with JSON payloads.
                         // This means if your frontend sends JSON data, it will be available
                         // on `req.body` in your route handlers.

// 5. Helper Functions for Reading and Writing to our JSON file
// These functions simulate database operations.

/**
 * Reads tasks from the tasks.json file.
 * If the file doesn't exist, it returns an empty array.
 * @returns {Array} An array of task objects.
 */
async function readTasks() {
    try {
        const data = await fs.readFile(DB_FILE, 'utf-8'); // Read the file content
        return JSON.parse(data); // Parse the JSON string into a JavaScript array/object
    } catch (error) {
        if (error.code === 'ENOENT') { // 'ENOENT' means "Error: No Entity" (file not found)
            console.warn(`Database file ${DB_FILE} not found. Starting with empty tasks.`);
            return []; // If file doesn't exist, return an empty array of tasks
        }
        console.error('Error reading tasks file:', error);
        throw error; // Re-throw other errors for the caller to handle
    }
}

/**
 * Writes an array of tasks to the tasks.json file.
 * @param {Array} tasks - The array of task objects to write.
 */
async function writeTasks(tasks) {
    // Stringify the JavaScript array/object into a JSON string,
    // with 2 spaces for pretty-printing (null, 2)
    await fs.writeFile(DB_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
}

// 6. Define API Routes (The CRUD Operations)

// A. GET /api/tasks: Read all tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await readTasks(); // Get all tasks from our "database"
        res.json(tasks); // Send the tasks back as a JSON response
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: 'Error fetching tasks' }); // Send a 500 error if something goes wrong
    }
});

// B. POST /api/tasks: Create a new task
app.post('/api/tasks', async (req, res) => {
    try {
        const tasks = await readTasks();
        const { title, description } = req.body; // Extract title and description from the request body

        // Basic validation
        if (!title || typeof title !== 'string' || title.trim() === '') {
            return res.status(400).json({ message: 'Title is required and must be a non-empty string.' });
        }

        const newTask = {
            id: Date.now().toString(), // Simple unique ID based on current timestamp
            title: title.trim(),
            description: (description && typeof description === 'string') ? description.trim() : '',
            completed: false, // New tasks are initially not completed
        };

        tasks.push(newTask); // Add the new task to our array
        await writeTasks(tasks); // Save the updated array back to the JSON file
        res.status(201).json(newTask); // Send back the newly created task with a 201 Created status
    } catch (error) {
        console.error('Error adding task:', error);
        res.status(500).json({ message: 'Error adding task' });
    }
});

// C. PUT /api/tasks/:id: Update an existing task
// `:id` is a route parameter, meaning the actual task ID will be part of the URL (e.g., /api/tasks/12345)
app.put('/api/tasks/:id', async (req, res) => {
    try {
        let tasks = await readTasks();
        const { id } = req.params; // Get the ID from the URL parameters
        const { title, description, completed } = req.body; // Get updated data from the request body

        const taskIndex = tasks.findIndex(task => task.id === id); // Find the task by its ID

        if (taskIndex === -1) {
            return res.status(404).json({ message: 'Task not found' }); // If task not found, send 404
        }

        // Update only the fields that are provided in the request body
        tasks[taskIndex] = {
            ...tasks[taskIndex], // Keep existing fields
            title: title !== undefined ? title.trim() : tasks[taskIndex].title,
            description: description !== undefined ? (description && typeof description === 'string' ? description.trim() : '') : tasks[taskIndex].description,
            completed: completed !== undefined ? !!completed : tasks[taskIndex].completed, // Ensure boolean for completed
        };

        await writeTasks(tasks); // Save the updated tasks
        res.json(tasks[taskIndex]); // Send back the updated task
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'Error updating task' });
    }
});

// D. DELETE /api/tasks/:id: Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        let tasks = await readTasks();
        const { id } = req.params; // Get the ID from the URL parameters

        const initialLength = tasks.length;
        // Filter out the task with the matching ID
        tasks = tasks.filter(task => task.id !== id);

        if (tasks.length === initialLength) {
            return res.status(404).json({ message: 'Task not found' }); // If no task was removed, ID wasn't found
        }

        await writeTasks(tasks); // Save the updated (deleted) tasks
        res.status(204).send(); // Send 204 No Content for successful deletion (common practice)
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: 'Error deleting task' });
    }
});

// 7. Start the Server
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});