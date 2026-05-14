const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// Get all tasks
router.get('/', async (req, res) => {
    try {
        const { search, status, page = 1, limit = 10 } = req.query;
        const query = { deleted_at: null };

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }
        if (status) {
            query.status = status;
        }

        const tasks = await Task.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ created_at: -1 });

        const count = await Task.countDocuments(query);

        res.json({
            tasks,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalTasks: count
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get specific task
router.get('/:id', async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, deleted_at: null });
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json(task);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create task
router.post('/', async (req, res) => {
    const task = new Task({
        title: req.body.title,
        description: req.body.description,
        status: req.body.status
    });

    try {
        const newTask = await task.save();
        res.status(201).json(newTask);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update task
router.put('/:id', async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, deleted_at: null });
        if (!task) return res.status(404).json({ message: 'Task not found' });

        if (req.body.title) task.title = req.body.title;
        if (req.body.description) task.description = req.body.description;
        if (req.body.status) task.status = req.body.status;

        const updatedTask = await task.save();
        res.json(updatedTask);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete task (Soft Delete)
router.delete('/:id', async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, deleted_at: null });
        if (!task) return res.status(404).json({ message: 'Task not found' });

        task.deleted_at = new Date();
        await task.save();
        res.json({ message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
