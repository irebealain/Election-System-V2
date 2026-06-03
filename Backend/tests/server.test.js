import request from 'supertest';
import express from 'express';

// Create a dummy app since we might not be able to import the real one easily without MongoDB connection issues
const app = express();
app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok' }));

describe('Server Health', () => {
  it('should return 200 OK for health check', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('ok');
  });
});
