const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
require('dotenv').config();

// Test user data
const testUser = {
  username: 'testuser99',
  email: 'testuser99@signmed.com',
  password: 'Test@1234'
};

let authToken = '';

// Connect to DB before all tests
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

// Clean up test user after all tests
afterAll(async () => {
  await mongoose.connection.collection('users').deleteOne({ email: testUser.email });
  await mongoose.connection.close();
});

// ─────────────────────────────────────────
describe('AUTH — /api/auth', () => {

  // ── REGISTER ──
  describe('POST /register', () => {

    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.username).toBe(testUser.username);
      expect(res.body.role).toBe('user');
    });

    it('should reject duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.statusCode).toBe(409);
      expect(res.body.error).toMatch(/email already registered/i);
    });

    it('should reject missing username', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'new@test.com', password: 'Test@1234' });

      expect(res.statusCode).toBe(400);
    });

    it('should reject short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'newuser', email: 'new2@test.com', password: '123' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/password/i);
    });

    it('should reject invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'newuser2', email: 'notanemail', password: 'Test@1234' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/email/i);
    });

    it('should reject username shorter than 3 characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'ab', email: 'ab@test.com', password: 'Test@1234' });

      expect(res.statusCode).toBe(400);
    });
  });

  // ── LOGIN ──
  describe('POST /login', () => {

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.username).toBe(testUser.username);
      expect(res.body).toHaveProperty('xp');
      expect(res.body).toHaveProperty('streak');

      // Save token for later tests
      authToken = res.body.token;
    });

    it('should reject wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'WrongPassword' });

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toMatch(/incorrect password/i);
    });

    it('should reject non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'ghost@nowhere.com', password: 'Test@1234' });

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toMatch(/no account found/i);
    });

    it('should reject login with missing password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email });

      expect(res.statusCode).toBe(400);
    });
  });

  // ── PROFILE ──
  describe('GET /me', () => {

    it('should return user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.username).toBe(testUser.username);
      expect(res.body).not.toHaveProperty('password');
    });

    it('should reject request with no token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.statusCode).toBe(401);
    });

    it('should reject request with fake token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer faketoken123');

      expect(res.statusCode).toBe(401);
    });
  });
});