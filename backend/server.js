// backend/server.js
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises'; // For reading/writing JSON file
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 5000;

// Get __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'tasks.json');

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Enable parsing of JSON request bodies

// Helper function to read tasks from the JSON file
async function readTasks() {
    try {
        const data = await fs.readFile(DB_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // File does not exist, return an empty array
            return [];
        }
        throw error; // Re-throw other errors
    }
}

// Helper function to write tasks to the JSON file
async function writeTasks(tasks) {
    await fs.writeFile(DB_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
}

// Routes

// GET all tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await readTasks();
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: 'Error fetching tasks' });
    }
});

// POST a new task
app.post('/api/tasks', async (req, res) => {
    try {
        const tasks = await readTasks();
        const { title, description } = req.body;
        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }
        const newTask = {
            id: Date.now().toString(), // Simple unique ID
            title,
            description: description || '',
            completed: false,
        };
        tasks.push(newTask);
        await writeTasks(tasks);
        res.status(201).json(newTask);
    } catch (error) {
        console.error('Error adding task:', error);
        res.status(500).json({ message: 'Error adding task' });
    }
});

// PUT (Update) a task
app.put('/api/tasks/:id', async (req, res) => {
    try {
        let tasks = await readTasks();
        const { id } = req.params;
        const { title, description, completed } = req.body;

        const taskIndex = tasks.findIndex(task => task.id === id);

        if (taskIndex === -1) {
            return res.status(404).json({ message: 'Task not found' });
        }

        tasks[taskIndex] = {
            ...tasks[taskIndex],
            title: title !== undefined ? title : tasks[taskIndex].title,
            description: description !== undefined ? description : tasks[taskIndex].description,
            completed: completed !== undefined ? completed : tasks[taskIndex].completed,
        };

        await writeTasks(tasks);
        res.json(tasks[taskIndex]);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'Error updating task' });
    }
});

// DELETE a task
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        let tasks = await readTasks();
        const { id } = req.params;

        const initialLength = tasks.length;
        tasks = tasks.filter(task => task.id !== id);

        if (tasks.length === initialLength) {
            return res.status(404).json({ message: 'Task not found' });
        }

        await writeTasks(tasks);
        res.status(204).send(); // No content for successful deletion
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: 'Error deleting task' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});