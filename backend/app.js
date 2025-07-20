const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = express();
const authRoutes = require('./routes/authRoutes');
const todoRoutes = require('./routes/todoRoutes');
const cors = require('cors');
dotenv.config();

app.use(cors());
app.use(express.json());
app.use('/todos', todoRoutes);
app.use('/auth', authRoutes);


app.get('/', (req, res) => {
    res.send('API is running');
});



module.exports = app
