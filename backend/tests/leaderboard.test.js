const request  = require('supertest');
const mongoose = require('mongoose');
const app      = require('../server');
require('dotenv').config();

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

// ─────────────────────────────────────────
describe('LEADERBOARD — /api/leaderboard', () => {

  describe('GET /', () => {

    it('should return overall top 10', async () => {
      const res = await request(app).get('/api/leaderboard');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeLessThanOrEqual(10);
    });

    it('should return scores with required fields', async () => {
      const res = await request(app).get('/api/leaderboard');

      expect(res.statusCode).toBe(200);
      if (res.body.length > 0) {
        const entry = res.body[0];
        expect(entry).toHaveProperty('username');
        expect(entry).toHaveProperty('score');
        expect(entry).toHaveProperty('language');
      }
    });

    it('should return scores in descending order', async () => {
      const res = await request(app).get('/api/leaderboard');

      expect(res.statusCode).toBe(200);
      for (let i = 1; i < res.body.length; i++) {
        expect(res.body[i - 1].score).toBeGreaterThanOrEqual(res.body[i].score);
      }
    });
  });

  describe('GET /:language', () => {

    it('should return ASL leaderboard', async () => {
      const res = await request(app).get('/api/leaderboard/asl');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return BSL leaderboard', async () => {
      const res = await request(app).get('/api/leaderboard/bsl');
      expect(res.statusCode).toBe(200);
    });

    it('should return ISL leaderboard', async () => {
      const res = await request(app).get('/api/leaderboard/isl');
      expect(res.statusCode).toBe(200);
    });

    it('should reject invalid language', async () => {
      const res = await request(app).get('/api/leaderboard/spanish');
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/invalid language/i);
    });

    it('should only return scores for requested language', async () => {
      const res = await request(app).get('/api/leaderboard/asl');
      expect(res.statusCode).toBe(200);
      res.body.forEach(entry => {
        expect(entry.language).toBe('asl');
      });
    });
  });
});