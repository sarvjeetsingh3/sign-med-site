const request  = require('supertest');
const mongoose = require('mongoose');
const app      = require('../server');
require('dotenv').config();

const testUser = {
  username: 'scoretest99',
  email: 'scoretest99@signmed.com',
  password: 'Test@1234'
};

let authToken = '';
let userId    = '';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // Register + login to get token
  const reg = await request(app)
    .post('/api/auth/register')
    .send(testUser);

  authToken = reg.body.token;

  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: testUser.email, password: testUser.password });

  authToken = login.body.token;
  userId    = login.body._id;
});

afterAll(async () => {
  await mongoose.connection.collection('users').deleteOne({ email: testUser.email });
  await mongoose.connection.collection('scores').deleteMany({ username: testUser.username });
  await mongoose.connection.close();
});

// ─────────────────────────────────────────
describe('SCORES — /api/scores', () => {

  // ── SAVE SCORE ──
  describe('POST /', () => {

    it('should save a valid score', async () => {
      const res = await request(app)
        .post('/api/scores')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ language: 'asl', mode: 'quiz', score: 850, xpEarned: 120, streak: 5 });

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toMatch(/score saved/i);
      expect(res.body.entry.score).toBe(850);
      expect(res.body).toHaveProperty('totalXP');
    });

    it('should save score with zero values', async () => {
      const res = await request(app)
        .post('/api/scores')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ language: 'bsl', mode: 'speed', score: 0, xpEarned: 0, streak: 0 });

      expect(res.statusCode).toBe(201);
    });

    it('should reject invalid language', async () => {
      const res = await request(app)
        .post('/api/scores')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ language: 'french', mode: 'quiz', score: 100, xpEarned: 20, streak: 1 });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/language/i);
    });

    it('should reject invalid mode', async () => {
      const res = await request(app)
        .post('/api/scores')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ language: 'asl', mode: 'flying', score: 100, xpEarned: 20, streak: 1 });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/mode/i);
    });

    it('should reject negative score', async () => {
      const res = await request(app)
        .post('/api/scores')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ language: 'asl', mode: 'quiz', score: -50, xpEarned: 10, streak: 0 });

      expect(res.statusCode).toBe(400);
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app)
        .post('/api/scores')
        .send({ language: 'asl', mode: 'quiz', score: 100, xpEarned: 10, streak: 1 });

      expect(res.statusCode).toBe(401);
    });
  });

  // ── GET MY SCORES ──
  describe('GET /me', () => {

    it('should return personal score history', async () => {
      const res = await request(app)
        .get('/api/scores/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('scores');
      expect(res.body).toHaveProperty('pagination');
      expect(Array.isArray(res.body.scores)).toBe(true);
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/api/scores/me?page=1&limit=1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.scores.length).toBeLessThanOrEqual(1);
      expect(res.body.pagination.limit).toBe(1);
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app).get('/api/scores/me');
      expect(res.statusCode).toBe(401);
    });
  });

  // ── STATS ──
  describe('GET /stats', () => {

    it('should return personal stats', async () => {
      const res = await request(app)
        .get('/api/scores/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('totalGames');
      expect(res.body).toHaveProperty('bestScore');
      expect(res.body).toHaveProperty('totalXP');
      expect(res.body).toHaveProperty('avgScore');
    });
  });
});