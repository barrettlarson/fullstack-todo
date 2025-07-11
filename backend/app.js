const express = require('express');
const app = express();
const todoRoutes = require('./routes/todoRoutes');
const suggestionRoutes = require('./routes/suggestionRoutes');

const cors = require('cors');
app.use(cors());
app.use(express.json());
app.use('/todos', todoRoutes);
app.use('/suggestions', suggestionRoutes);

app.get('/', (req, res) => {
    res.send('API is running');
});

module.exports = app
