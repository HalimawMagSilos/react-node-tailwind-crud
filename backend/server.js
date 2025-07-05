// backend/server.js
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv'; // Import dotenv

dotenv.config(); // Load environment variables from .env

// Helper function for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Configuration ---
const PORT = process.env.PORT || 5000;

// Use DB_PATH from .env or default to local path for development
// For local: DB_PATH=./tasks.json in .env -> resolves to backend/tasks.json
// For Railway: DB_PATH=/var/data/tasks.json in Railway env vars
const DB_FILE = process.env.DB_PATH ? process.env.DB_PATH : path.join(__dirname, 'tasks.json');

// Ensure the directory for DB_FILE exists if it's a specific path (like /var/data)
// This is useful for deployment where /var/data might be an empty mount.
async function ensureDbDirectory() {
    const dbDir = path.dirname(DB_FILE);
    try {
        await fs.mkdir(dbDir, { recursive: true });
        console.log(`Ensured directory exists: ${dbDir}`);
    } catch (error) {
        if (error.code !== 'EEXIST') { // Ignore if directory already exists
            console.error(`Error ensuring directory ${dbDir}:`, error);
            process.exit(1); // Exit if critical error
        }
    }
}


const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Utility Functions for Reading/Writing Tasks ---
async function readTasks() {
    try {
        const data = await fs.readFile(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log(`Database file ${DB_FILE} not found. Starting with empty tasks.`);
            return [];
        }
        console.error('Error reading tasks file:', error);
        throw error;
    }
}

async function writeTasks(tasks) {
    try {
        await fs.writeFile(DB_FILE, JSON.stringify(tasks, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing tasks file:', error);
        throw error;
    }
}

// --- API Routes ---

// GET /api/tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await readTasks();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving tasks' });
    }
});

// POST /api/tasks
app.post('/api/tasks', async (req, res) => {
    try {
        const tasks = await readTasks();
        const newTask = {
            id: Date.now().toString(),
            text: req.body.text,
            completed: false
        };
        tasks.push(newTask);
        await writeTasks(tasks);
        res.status(201).json(newTask);
    } catch (error) {
        console.error('Error adding task:', error);
        res.status(500).json({ message: 'Error adding task' });
    }
});

// PUT /api/tasks/:id
app.put('/api/tasks/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const updatedTaskData = req.body;
        let tasks = await readTasks();
        const taskIndex = tasks.findIndex(task => task.id === taskId);

        if (taskIndex === -1) {
            return res.status(404).json({ message: 'Task not found' });
        }

        tasks[taskIndex] = { ...tasks[taskIndex], ...updatedTaskData, id: taskId };
        await writeTasks(tasks);
        res.json(tasks[taskIndex]);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'Error updating task' });
    }
});

// DELETE /api/tasks/:id
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        let tasks = await readTasks();
        const initialLength = tasks.length;
        tasks = tasks.filter(task => task.id !== taskId);

        if (tasks.length === initialLength) {
            return res.status(404).json({ message: 'Task not found' });
        }

        await writeTasks(tasks);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: 'Error deleting task' });
    }
});

// --- Start Server ---
ensureDbDirectory().then(() => {
    app.listen(PORT, () => {
        console.log(`Backend server running on port ${PORT}`);
        console.log(`Tasks data path: ${DB_FILE}`);
    });
});