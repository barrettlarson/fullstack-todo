require('dotenv').config();
const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');

let token;

beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);

    await User.deleteOne({ username: 'testuser@gmail.com' });

    // Register and login to get a token
    const registerRes = await request(app)
        .post('/auth/register')
        .send({ username: 'testuser@gmail.com', password: 'password123' });

    const loginRes = await request(app)
        .post('/auth/login')
        .send({ username: 'testuser@gmail.com', password: 'password123' });

    token = loginRes.body.token;
    console.log('Register status:', registerRes.statusCode);
    console.log('Register response:', registerRes.body);
    
});

afterAll(async () => {
    await mongoose.disconnect();
});

beforeEach(async () => {
    const Todo = require('../models/todo');
    await Todo.deleteMany({});
    await User.deleteMany({});
});

describe('POST /todos', () => {
    it('should create a new todo', async () => {
        const res = await request(app)
            .post('/todos')
            .set('Authorization', `Bearer ${token}`)
            .send({ text: 'Write TDD test' });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.text).toBe('Write TDD test');
        expect(res.body.completed).toBe(false);
    });

    it('should return 400 for missing text field', async () => {
        const res = await request(app)
            .post('/todos')
            .set('Authorization', `Bearer ${token}`)
            .send({});
        expect(res.statusCode).toBe(400);
    });

    it('should create a todo with only known fields', async () => {
        const res = await request(app)
            .post('/todos')
            .set('Authorization', `Bearer ${token}`)
            .send({ text: 'Write TDD test', foo: 'bar' });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.text).toBe('Write TDD test');
        expect(res.body.completed).toBe(false);
        expect(res.body).not.toHaveProperty('foo');
    });
});

describe('GET /todos', () => {
    it('should return all todos', async () => {
        const res = await request(app)
            .get('/todos')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toBeInstanceOf(Array);
    });

    it('should return an empty array if no todos exist', async () => {
        const res = await request(app)
            .get('/todos')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });

    it('should return all todos', async () => {
        await request(app)
            .post('/todos')
            .set('Authorization', `Bearer ${token}`)
            .send({ text: 'First todo' });
        await request(app)
            .post('/todos')
            .set('Authorization', `Bearer ${token}`)
            .send({ text: 'Second todo' });

        const res = await request(app)
            .get('/todos')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2);
        expect(res.body[0]).toHaveProperty('_id');
        expect(res.body[0].text).toBe('First todo');
        expect(res.body[1].text).toBe('Second todo');
    });
});

describe('PUT /todos/:id', () => {
    it('should update a todo', async () => {
        const res = await request(app)
            .post('/todos')
            .set('Authorization', `Bearer ${token}`)
            .send({ text: 'Write TDD test' });
        const todoId = res.body._id;

        const updateRes = await request(app)
            .put(`/todos/${todoId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ text: 'Write TDD test - updated', completed: true });
        expect(updateRes.statusCode).toBe(200);
        expect(updateRes.body).toHaveProperty('_id', todoId);
    });

    it('should return 404 if todo not found', async () => {
        const res = await request(app)
            .put('/todos/invalidId')
            .set('Authorization', `Bearer ${token}`)
            .send({ text: 'Invalid' });
        expect(res.statusCode).toBe(404);
    });

    it('should return 400 for no updated fields', async () => {
        const res = await request(app)
            .post('/todos')
            .set('Authorization', `Bearer ${token}`)
            .send({ text: 'Write TDD test' });
        const todoId = res.body._id;

        const updateRes = await request(app)
            .put(`/todos/${todoId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({});
        expect(updateRes.statusCode).toBe(400);
    });

    it('should update a todo with only known fields', async () => {
        const res = await request(app)
            .post('/todos')
            .set('Authorization', `Bearer ${token}`)
            .send({ text: 'Write TDD test' });
        const todoId = res.body._id;

        const updateRes = await request(app)
            .put(`/todos/${todoId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ text: 'Write TDD test - updated', foo: 'bar' });
        expect(updateRes.statusCode).toBe(200);
        expect(updateRes.body.text).toBe('Write TDD test - updated');
        expect(updateRes.body).not.toHaveProperty('foo');
    });
});

describe('DELETE /todos/:id', () => {
    it('should delete a todo', async () => {
        const res = await request(app)
            .post('/todos')
            .set('Authorization', `Bearer ${token}`)
            .send({ text: 'Write TDD test' });
        const todoId = res.body._id;

        const deleteRes = await request(app)
            .delete(`/todos/${todoId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(deleteRes.statusCode).toBe(200);
        expect(deleteRes.body).toHaveProperty('message', 'Todo deleted successfully');

        const getRes = await request(app)
            .get('/todos')
            .set('Authorization', `Bearer ${token}`);
        expect(getRes.body).toEqual([]);
    });

    it('should return 404 if todo not found', async () => {
        const res = await request(app)
            .delete('/todos/invalidId')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(404);
    });
});
