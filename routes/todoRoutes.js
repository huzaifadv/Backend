// backend/routes/todoRoutes.js
// API routes for CRUD operations on Todos

const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');

// GET all todos (sorted by newest first)
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching todos', error: error.message });
  }
});

// POST create new todo
router.post('/', async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Title is required' });
    }

    const newTodo = new Todo({ title: title.trim() });
    const savedTodo = await newTodo.save();
    res.status(201).json(savedTodo);
  } catch (error) {
    res.status(500).json({ message: 'Error creating todo', error: error.message });
  }
});

// PUT update todo (title or completed status)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (completed !== undefined) updateData.completed = completed;

    const updatedTodo = await Todo.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedTodo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.json(updatedTodo);
  } catch (error) {
    res.status(500).json({ message: 'Error updating todo', error: error.message });
  }
});

// DELETE todo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTodo = await Todo.findByIdAndDelete(id);

    if (!deletedTodo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.json({ message: 'Todo deleted successfully', todo: deletedTodo });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting todo', error: error.message });
  }
});

module.exports = router;
