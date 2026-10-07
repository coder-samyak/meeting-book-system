export function validateTimeOrder(startDate, endDate) {
  if (endDate.getTime() <= startDate.getTime()) {
    return {
      valid: false,
      code: 'INVALID_TIME_ORDER',
      message: 'End time must be after start time.'
    };
  }
  return { valid: true };
}

export function validate15MinBoundaries(startDate, endDate) {
  const startMin = startDate.getUTCMinutes();
  const startSec = startDate.getUTCSeconds();
  const startMs = startDate.getUTCMilliseconds();

  const endMin = endDate.getUTCMinutes();
  const endSec = endDate.getUTCSeconds();
  const endMs = endDate.getUTCMilliseconds();

  if (
    startMin % 15 !== 0 || startSec !== 0 || startMs !== 0 ||
    endMin % 15 !== 0 || endSec !== 0 || endMs !== 0
  ) {
    return {
      valid: false,
      code: 'INVALID_15_MIN_BOUNDARY',
      message: 'Start and end times must fall on 15-minute boundaries (minutes 00, 15, 30, or 45, with 00 seconds).'
    };
  }
  return { valid: true };
}

export function validateDuration(startDate, endDate) {
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffMinutes = diffMs / (1000 * 60);

  if (diffMinutes < 15 || diffMinutes > 240) {
    return {
      valid: false,
      code: 'INVALID_DURATION',
      message: 'Booking duration must be at least 15 minutes and at most 4 hours.'
    };
  }
  return { valid: true };
}

export function validateBusinessHours(startDate, endDate) {
  const sameDay = 
    startDate.getUTCFullYear() === endDate.getUTCFullYear() &&
    startDate.getUTCMonth() === endDate.getUTCMonth() &&
    startDate.getUTCDate() === endDate.getUTCDate();

  if (!sameDay) {
    return {
      valid: false,
      code: 'SPAN_MULTIPLE_DAYS',
      message: 'Booking must start and end on the same UTC day.'
    };
  }

  const startHour = startDate.getUTCHours();
  const endHour = endDate.getUTCHours();
  const endMin = endDate.getUTCMinutes();

  const isStartValid = startHour >= 8 && startHour < 20;
  const isEndValid = (endHour > 8 && endHour < 20) || (endHour === 20 && endMin === 0);

  if (!isStartValid || !isEndValid) {
    return {
      valid: false,
      code: 'OUTSIDE_BUSINESS_HOURS',
      message: 'Bookings must fall entirely within business hours (08:00 to 20:00 UTC).'
    };
  }
  return { valid: true };
}

export function validateNotInPast(startDate, referenceNow = new Date()) {
  if (startDate.getTime() < referenceNow.getTime()) {
    return {
      valid: false,
      code: 'PAST_BOOKING',
      message: 'A booking cannot start in the past.'
    };
  }
  return { valid: true };
}

export function validateCapacity(attendees, roomCapacity) {
  if (!Number.isInteger(attendees) || attendees < 1) {
    return {
      valid: false,
      code: 'INVALID_ATTENDEES',
      message: 'Attendees must be an integer of at least 1.'
    };
  }
  if (attendees > roomCapacity) {
    return {
      valid: false,
      code: 'CAPACITY_EXCEEDED',
      message: `Attendees count (${attendees}) exceeds room capacity (${roomCapacity}).`
    };
  }
  return { valid: true };
}

export function isOverlapping(newStart, newEnd, exStart, exEnd) {
  const nStart = new Date(newStart).getTime();
  const nEnd = new Date(newEnd).getTime();
  const eStart = new Date(exStart).getTime();
  const eEnd = new Date(exEnd).getTime();

  return nStart < eEnd && eStart < nEnd;
}

export function validateBookingRules({ title, organizerEmail, attendees, start, end, roomCapacity, referenceNow }) {
  const trimmedTitle = typeof title === 'string' ? title.trim() : '';
  if (!trimmedTitle || trimmedTitle.length < 1 || trimmedTitle.length > 100) {
    return {
      valid: false,
      code: 'INVALID_TITLE',
      message: 'Title must be between 1 and 100 characters after trimming.'
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!organizerEmail || !emailRegex.test(organizerEmail)) {
    return {
      valid: false,
      code: 'INVALID_EMAIL',
      message: 'Organizer email must be a valid email address.'
    };
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return {
      valid: false,
      code: 'INVALID_DATE_FORMAT',
      message: 'Start and end times must be valid ISO 8601 UTC timestamps.'
    };
  }

  const r1 = validateTimeOrder(startDate, endDate);
  if (!r1.valid) return r1;

  const r2 = validate15MinBoundaries(startDate, endDate);
  if (!r2.valid) return r2;

  const r3 = validateDuration(startDate, endDate);
  if (!r3.valid) return r3;

  const r4 = validateBusinessHours(startDate, endDate);
  if (!r4.valid) return r4;

  const r5 = validateNotInPast(startDate, referenceNow);
  if (!r5.valid) return r5;

  const r6 = validateCapacity(attendees, roomCapacity);
  if (!r6.valid) return r6;

  return { valid: true, trimmedTitle, startDate, endDate };
}
