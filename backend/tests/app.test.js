const request = require('supertest');
const app = require('../app')

describe('Base API route', () => {
    it('GET / should return API is running', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toBe(200);
        expect(res.text).toBe('API is running');
    });
});
