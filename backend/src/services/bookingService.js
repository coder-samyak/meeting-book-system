import { Room } from '../models/Room.js';
import { Booking } from '../models/Booking.js';
import { withRoomLock } from '../config/database.js';
import { validateBookingRules, isOverlapping, validateTimeOrder, validate15MinBoundaries, validateDuration, validateBusinessHours } from '../utils/rules.js';

export async function getAllRooms() {
  return await Room.findAll();
}

export async function getBookings({ date, roomId }) {
  return await Booking.findConfirmedByDateAndRoom({ date, roomId });
}

export async function createBooking(data) {
  const { roomId, title, organizerEmail, attendees, start, end } = data;

  const room = await Room.findById(roomId);
  if (!room) {
    const error = new Error(`Room with ID ${roomId} not found.`);
    error.status = 404;
    error.code = 'ROOM_NOT_FOUND';
    throw error;
  }

  const ruleCheck = validateBookingRules({
    title,
    organizerEmail,
    attendees: Number(attendees),
    start,
    end,
    roomCapacity: room.capacity
  });

  if (!ruleCheck.valid) {
    const error = new Error(ruleCheck.message);
    error.status = 400;
    error.code = ruleCheck.code;
    throw error;
  }

  const { trimmedTitle, startDate, endDate } = ruleCheck;
  const startIso = startDate.toISOString();
  const endIso = endDate.toISOString();
  const utcDayStr = startIso.substring(0, 10);

  return await withRoomLock(roomId, async () => {
    const organizerBookings = await Booking.findConfirmedByOrganizerAndDate(organizerEmail, utcDayStr);

    if (organizerBookings.length >= 3) {
      const error = new Error(`Organizer ${organizerEmail} already holds 3 confirmed bookings for ${utcDayStr}.`);
      error.status = 409;
      error.code = 'MAX_BOOKINGS_EXCEEDED';
      throw error;
    }

    const existingBookings = await Booking.findConfirmedByRoomId(roomId);

    for (const ex of existingBookings) {
      if (isOverlapping(startIso, endIso, ex.start, ex.end)) {
        const error = new Error(`Room ${room.name} is already booked from ${new Date(ex.start).toUTCString().substring(17, 22)} to ${new Date(ex.end).toUTCString().substring(17, 22)} UTC.`);
        error.status = 409;
        error.code = 'BOOKING_CONFLICT';
        error.details = { conflictingBookingId: ex.id };
        throw error;
      }
    }

    const createdAt = new Date().toISOString();
    return await Booking.create({
      roomId,
      title: trimmedTitle,
      organizerEmail,
      attendees: Number(attendees),
      start: startIso,
      end: endIso,
      createdAt
    });
  });
}

export async function cancelBooking(id) {
  const booking = await Booking.findById(id);
  if (!booking) {
    const error = new Error(`Booking with ID ${id} not found.`);
    error.status = 404;
    error.code = 'BOOKING_NOT_FOUND';
    throw error;
  }

  if (booking.status === 'cancelled') {
    return { success: true, message: 'Booking was already cancelled.', booking };
  }

  const now = new Date();
  const startTime = new Date(booking.start);

  if (startTime.getTime() <= now.getTime()) {
    const error = new Error('A booking that has already started cannot be cancelled.');
    error.status = 409;
    error.code = 'CANNOT_CANCEL_STARTED';
    throw error;
  }

  const updated = await Booking.updateStatus(id, 'cancelled');
  return { success: true, message: 'Booking cancelled successfully.', booking: updated };
}

export async function searchAvailability({ date, start, end, minCapacity = 1 }) {
  if (!date || !start || !end) {
    const error = new Error('Date, start time, and end time are required.');
    error.status = 400;
    error.code = 'MISSING_PARAMETERS';
    throw error;
  }

  const startIso = `${date}T${start}:00Z`;
  const endIso = `${date}T${end}:00Z`;

  const startDate = new Date(startIso);
  const endDate = new Date(endIso);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    const error = new Error('Invalid start or end time format.');
    error.status = 400;
    error.code = 'INVALID_TIME_FORMAT';
    throw error;
  }

  const r1 = validateTimeOrder(startDate, endDate);
  if (!r1.valid) { const err = new Error(r1.message); err.status = 400; err.code = r1.code; throw err; }

  const r2 = validate15MinBoundaries(startDate, endDate);
  if (!r2.valid) { const err = new Error(r2.message); err.status = 400; err.code = r2.code; throw err; }

  const r3 = validateDuration(startDate, endDate);
  if (!r3.valid) { const err = new Error(r3.message); err.status = 400; err.code = r3.code; throw err; }

  const r4 = validateBusinessHours(startDate, endDate);
  if (!r4.valid) { const err = new Error(r4.message); err.status = 400; err.code = r4.code; throw err; }

  const candidateRooms = await Room.findAvailableByCapacity(minCapacity);

  const availableRooms = [];

  for (const room of candidateRooms) {
    const existingBookings = await Booking.findConfirmedByRoomId(room.id);

    let conflict = false;
    for (const ex of existingBookings) {
      if (isOverlapping(startIso, endIso, ex.start, ex.end)) {
        conflict = true;
        break;
      }
    }

    if (!conflict) {
      availableRooms.push(room);
    }
  }

  availableRooms.sort((a, b) => a.capacity - b.capacity);
  return availableRooms;
}
