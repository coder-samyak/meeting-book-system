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

test('GET /api/rooms returns seeded 5 rooms', async () => {
  const res = await fetch(`${baseUrl}/api/rooms`);
  assert.equal(res.status, 200);
  const rooms = await res.json();
  assert.equal(rooms.length, 5);
  assert.equal(rooms[0].name, 'Atlas');
});

test('API Integration: Create booking and attempt overlapping booking (Expect 409 Conflict)', async () => {
  const uniqueDate = `2035-06-${Math.floor(10 + Math.random() * 15)}`;
  const bookingData = {
    roomId: 1,
    title: 'Integration Test Sync',
    organizerEmail: 'integration@example.com',
    attendees: 3,
    start: `${uniqueDate}T10:00:00Z`,
    end: `${uniqueDate}T11:00:00Z`
  };

  // 1. Create first booking -> Expect 201 Created
  const res1 = await fetch(`${baseUrl}/api/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData)
  });
  assert.equal(res1.status, 201);
  const created = await res1.json();
  assert.equal(created.title, 'Integration Test Sync');
  assert.equal(created.status, 'confirmed');

  // 2. Create overlapping booking -> Expect 409 Conflict
  const res2 = await fetch(`${baseUrl}/api/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...bookingData,
      title: 'Conflicting Booking',
      start: `${uniqueDate}T10:30:00Z`,
      end: `${uniqueDate}T11:30:00Z`
    })
  });

  assert.equal(res2.status, 409);
  const errorJson = await res2.json();
  assert.equal(errorJson.error.code, 'BOOKING_CONFLICT');
  assert.ok(errorJson.error.message.includes('Atlas'));
  assert.equal(errorJson.error.details.conflictingBookingId, created.id);
});
