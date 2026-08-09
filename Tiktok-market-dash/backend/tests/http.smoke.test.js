import test from 'node:test';
import assert from 'node:assert/strict';
import request from '../src/app.js';

// Lightweight smoke without DB: root + rate-limit shape via Express app.
// Full authenticated API tests require a running Postgres + migrations.

test('GET / returns API envelope', async () => {
  const server = request;
  const http = await import('node:http');
  await new Promise((resolve, reject) => {
    const s = http.createServer(server);
    s.listen(0, '127.0.0.1', async () => {
      try {
        const { port } = s.address();
        const res = await fetch(`http://127.0.0.1:${port}/`);
        const body = await res.json();
        assert.equal(res.status, 200);
        assert.equal(body.success, true);
        assert.ok(body.data?.health);
        s.close(resolve);
      } catch (err) {
        s.close(() => reject(err));
      }
    });
  });
});

test('GET /api/v1/health responds', async () => {
  const http = await import('node:http');
  await new Promise((resolve, reject) => {
    const s = http.createServer(request);
    s.listen(0, '127.0.0.1', async () => {
      try {
        const { port } = s.address();
        const res = await fetch(`http://127.0.0.1:${port}/api/v1/health`);
        assert.ok([200, 503].includes(res.status));
        const body = await res.json();
        assert.equal(typeof body.success, 'boolean');
        s.close(resolve);
      } catch (err) {
        s.close(() => reject(err));
      }
    });
  });
});

test('protected route returns 401 without token', async () => {
  const http = await import('node:http');
  await new Promise((resolve, reject) => {
    const s = http.createServer(request);
    s.listen(0, '127.0.0.1', async () => {
      try {
        const { port } = s.address();
        const res = await fetch(`http://127.0.0.1:${port}/api/v1/settings`);
        assert.equal(res.status, 401);
        const body = await res.json();
        assert.equal(body.success, false);
        assert.ok(body.statusCode === 401 || body.message);
        s.close(resolve);
      } catch (err) {
        s.close(() => reject(err));
      }
    });
  });
});

test('orders and products routes return 401 without token', async () => {
  const http = await import('node:http');
  await new Promise((resolve, reject) => {
    const s = http.createServer(request);
    s.listen(0, '127.0.0.1', async () => {
      try {
        const { port } = s.address();
        for (const path of ['/api/v1/orders', '/api/v1/products']) {
          const res = await fetch(`http://127.0.0.1:${port}${path}`);
          assert.equal(res.status, 401);
          const body = await res.json();
          assert.equal(body.success, false);
        }
        s.close(resolve);
      } catch (err) {
        s.close(() => reject(err));
      }
    });
  });
});
