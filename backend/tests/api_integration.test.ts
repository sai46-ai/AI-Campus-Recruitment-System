import request from 'supertest';
import app from '../src/app';

describe('API Health and Route Integration Tests', () => {
  it('GET /api/v1/health should return system status ok', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('system', 'AI Campus Recruitment System API');
  });

  it('GET /api/health should map correctly via fallback route', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  it('GET /api/v1/ready should return readiness status and components health', async () => {
    const res = await request(app).get('/api/v1/ready');
    expect([200, 503]).toContain(res.status);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('database');
    expect(res.body).toHaveProperty('redis');
    expect(res.body).toHaveProperty('cacheMode');
  });

  it('GET /api/v1/invalid-route should return 404', async () => {
    const res = await request(app).get('/api/v1/invalid-route');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('success', false);
  });
});
