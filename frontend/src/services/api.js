const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export async function fetchRooms() {
  const res = await fetch(`${API_BASE}/rooms`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error?.message || 'Failed to fetch rooms');
  }
  return await res.json();
}

export async function fetchBookings(date, roomId = '') {
  const params = new URLSearchParams();
  if (date) params.append('date', date);
  if (roomId) params.append('roomId', roomId);

  const res = await fetch(`${API_BASE}/bookings?${params.toString()}`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error?.message || 'Failed to fetch bookings');
  }
  return await res.json();
}

export async function createBooking(bookingData) {
  const res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData)
  });

  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.error?.message || 'Failed to create booking');
    error.code = data.error?.code;
    error.details = data.error?.details;
    throw error;
  }
  return data;
}

export async function cancelBookingApi(id) {
  const res = await fetch(`${API_BASE}/bookings/${id}`, {
    method: 'DELETE'
  });

  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.error?.message || 'Failed to cancel booking');
    error.code = data.error?.code;
    throw error;
  }
  return data;
}

export async function searchAvailabilityApi({ date, start, end, minCapacity }) {
  const params = new URLSearchParams({ date, start, end, minCapacity: minCapacity || 1 });
  const res = await fetch(`${API_BASE}/availability?${params.toString()}`);

  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.error?.message || 'Failed to search room availability');
    error.code = data.error?.code;
    throw error;
  }
  return data;
}
