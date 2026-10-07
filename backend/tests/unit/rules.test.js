import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateTimeOrder,
  validate15MinBoundaries,
  validateDuration,
  validateBusinessHours,
  validateNotInPast,
  validateCapacity,
  isOverlapping
} from '../../src/utils/rules.js';

// R1: end must be after start
test('R1: end time must be after start time', () => {
  const start = new Date('2030-05-14T10:00:00Z');
  const equalEnd = new Date('2030-05-14T10:00:00Z');
  const earlierEnd = new Date('2030-05-14T09:45:00Z');
  const validEnd = new Date('2030-05-14T10:15:00Z');

  assert.equal(validateTimeOrder(start, equalEnd).valid, false);
  assert.equal(validateTimeOrder(start, earlierEnd).valid, false);
  assert.equal(validateTimeOrder(start, validEnd).valid, true);
});

// R2: start and end must fall on 15-minute boundaries
test('R2: 15-minute boundary validation', () => {
  const validStart = new Date('2030-05-14T10:15:00Z');
  const validEnd = new Date('2030-05-14T11:30:00Z');
  const badMinutes = new Date('2030-05-14T10:12:00Z');
  const badSeconds = new Date('2030-05-14T10:15:05Z');

  assert.equal(validate15MinBoundaries(validStart, validEnd).valid, true);
  assert.equal(validate15MinBoundaries(badMinutes, validEnd).valid, false);
  assert.equal(validate15MinBoundaries(validStart, badSeconds).valid, false);
});

// R3: duration must be between 15 mins and 4 hours
test('R3: booking duration limits', () => {
  const start = new Date('2030-05-14T10:00:00Z');
  const tooShort = new Date('2030-05-14T10:10:00Z');
  const exactMin = new Date('2030-05-14T10:15:00Z');
  const exactMax = new Date('2030-05-14T14:00:00Z');
  const tooLong = new Date('2030-05-14T14:15:00Z');

  assert.equal(validateDuration(start, tooShort).valid, false);
  assert.equal(validateDuration(start, exactMin).valid, true);
  assert.equal(validateDuration(start, exactMax).valid, true);
  assert.equal(validateDuration(start, tooLong).valid, false);
});

// R4: business hours (08:00 to 20:00 UTC) and same day
test('R4: business hours 08:00-20:00 UTC and same UTC day', () => {
  const start = new Date('2030-05-14T08:00:00Z');
  const end = new Date('2030-05-14T20:00:00Z');
  const earlyStart = new Date('2030-05-14T07:45:00Z');
  const lateEnd = new Date('2030-05-14T20:15:00Z');
  const overnight = new Date('2030-05-15T09:00:00Z');

  assert.equal(validateBusinessHours(start, end).valid, true);
  assert.equal(validateBusinessHours(earlyStart, end).valid, false);
  assert.equal(validateBusinessHours(start, lateEnd).valid, false);
  assert.equal(validateBusinessHours(start, overnight).valid, false);
});

// R6: capacity check
test('R6: attendees count vs room capacity', () => {
  assert.equal(validateCapacity(4, 4).valid, true);
  assert.equal(validateCapacity(5, 4).valid, false);
  assert.equal(validateCapacity(0, 4).valid, false);
});

// R7: Overlap reference table cases from specification
test('R7: Overlap reference cases for existing booking 10:00-11:00 UTC', () => {
  const exStart = '2030-05-14T10:00:00Z';
  const exEnd = '2030-05-14T11:00:00Z';

  // 09:00 to 10:00 -> Allowed (Ends exactly when existing starts)
  assert.equal(isOverlapping('2030-05-14T09:00:00Z', '2030-05-14T10:00:00Z', exStart, exEnd), false);

  // 11:00 to 12:00 -> Allowed (Starts exactly when existing ends)
  assert.equal(isOverlapping('2030-05-14T11:00:00Z', '2030-05-14T12:00:00Z', exStart, exEnd), false);

  // 09:30 to 10:30 -> Rejected (Overlaps start)
  assert.equal(isOverlapping('2030-05-14T09:30:00Z', '2030-05-14T10:30:00Z', exStart, exEnd), true);

  // 10:30 to 11:30 -> Rejected (Overlaps end)
  assert.equal(isOverlapping('2030-05-14T10:30:00Z', '2030-05-14T11:30:00Z', exStart, exEnd), true);

  // 10:15 to 10:45 -> Rejected (Fully inside)
  assert.equal(isOverlapping('2030-05-14T10:15:00Z', '2030-05-14T10:45:00Z', exStart, exEnd), true);

  // 09:00 to 12:00 -> Rejected (Fully contains)
  assert.equal(isOverlapping('2030-05-14T09:00:00Z', '2030-05-14T12:00:00Z', exStart, exEnd), true);

  // 10:00 to 11:00 -> Rejected (Identical)
  assert.equal(isOverlapping('2030-05-14T10:00:00Z', '2030-05-14T11:00:00Z', exStart, exEnd), true);
});
