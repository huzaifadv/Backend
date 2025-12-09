// backend/models/Todo.js
// Mongoose schema and model for Todo

const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Export the model
module.exports = mongoose.model('Todo', todoSchema);
