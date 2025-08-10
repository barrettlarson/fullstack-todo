const express = require('express');
const authRoutes = require('./routes/authRoutes');
const todoRoutes = require('./routes/todoRoutes');

const app = express();

const allowedOrigins = [
    'http://localhost:5173',
    'https://<your-swa-name>.azurestaticapps.net' // TODO: Replace with actual Azure Static Web App URL
]

const cors = require('cors');

app.use(cors({
    origin(origin, cb) {
        if (!origin) return cb(null, true);
        return allowedOrigins.includes(origin) ? cb(null, true) : cb(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false
}));

app.use(express.json());

app.get('/health', (req, res) => res.status(200).send('OK'));

app.use('/todos', todoRoutes);
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('API is running');
});

module.exports = app
