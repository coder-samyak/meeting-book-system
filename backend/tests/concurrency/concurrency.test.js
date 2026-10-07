import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../../src/app.js';
import { initDb } from '../../src/config/database.js';

let server;
let baseUrl;

test.before(async () => {
  await initDb();
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    server.close();
  }
});

test('Concurrency Protection: Simultaneous conflicting requests result in exactly ONE success (201) and ONE conflict (409)', async () => {
  const uniqueDate = `2036-07-${Math.floor(10 + Math.random() * 15)}`;
  const requestA = {
    roomId: 2, // Borealis
    title: 'Concurrent Meeting A',
    organizerEmail: 'usera@example.com',
    attendees: 4,
    start: `${uniqueDate}T14:00:00Z`,
    end: `${uniqueDate}T15:00:00Z`
  };

  const requestB = {
    roomId: 2, // Borealis
    title: 'Concurrent Meeting B',
    organizerEmail: 'userb@example.com',
    attendees: 4,
    start: `${uniqueDate}T14:00:00Z`,
    end: `${uniqueDate}T15:00:00Z`
  };

  // Fire both requests simultaneously using Promise.all
  const [resA, resB] = await Promise.all([
    fetch(`${baseUrl}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestA)
    }),
    fetch(`${baseUrl}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestB)
    })
  ]);

  const statuses = [resA.status, resB.status].sort();

  // Assert that exactly one request returns 201 Created and the other returns 409 Conflict!
  assert.deepEqual(statuses, [201, 409]);
});
