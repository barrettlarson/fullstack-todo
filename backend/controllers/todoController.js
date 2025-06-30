const Todo = require('../models/todo');
const mongoose = require('mongoose');

const createTodo = async (req, res) => {
    try {
        const { text } = req.body;
        const newTodo = await Todo.create({ text });
        res.status(201).json(newTodo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getTodos = async (req, res) => {
    try {
        const todos = await Todo.find();
        res.status(200).json(todos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateTodo = async (req, res) => {
    try {
        const { id } = req.params;
        const { text, completed } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        const updates = {};
        if (text !== undefined) {
            if (typeof text !== 'string') {
                return res.status(400).json({ message: 'Invalid text input' });
            }
            updates.text = text;
        }

        if (completed !== undefined) {
            if (typeof completed !== 'boolean') {
                return res.status(400).json({ message: 'Invalid completed input' });
            }
            updates.completed = completed;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No valid fields provided for update' });
        }

        const updatedTodo = await Todo.findOneAndUpdate({ _id: id, }, updates, { new: true });
        if (!updatedTodo) {
            return res.status(404).json({ message: 'Todo not found' });
        } 
        res.status(200).json(updatedTodo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteTodo = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        const deletedTodo = await Todo.findOneAndDelete({ _id: id });
        if (!deletedTodo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        res.status(200).json({ message: 'Todo deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createTodo, getTodos, updateTodo, deleteTodo };