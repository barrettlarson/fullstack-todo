require('dotenv').config();
const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');

let token;

beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
});

afterAll(async () => {
    await mongoose.disconnect();
});

beforeEach(async () => {
    await User.deleteMany({});
});

describe('POST /auth/register', () => {
    it('should register a new user', async () => {
        await User.deleteOne({ username: 'testuser@gmail.com' });
        const res = await request(app)
            .post('/auth/register')
            .send({ username: 'testuser@gmail.com', password: 'password123' });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.username).toBe('testuser@gmail.com');
    });

    it('should return 400 for missing fields', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({});
        expect(res.statusCode).toBe(400);
    });
});

describe('POST /auth/login', () => {
    it('should login an existing user', async () => {
        // First register a user
        await request(app)
            .post('/auth/register')
            .send({ username: 'testuser@gmail.com', password: 'password123' });

        const res = await request(app)
            .post('/auth/login')
            .send({ username: 'testuser@gmail.com', password: 'password123' });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.username).toBe('testuser@gmail.com');
        token = res.body.token; // Store token for further tests
    });

    it('should return 401 for invalid credentials', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ username: 'wronguser', password: 'wrongpass' });
        expect(res.statusCode).toBe(401);
    });
});