import { getBookings, createBooking, cancelBooking } from '../services/bookingService.js';

export async function listBookings(req, res, next) {
  try {
    const { date, roomId } = req.query;
    const bookings = await getBookings({ date, roomId });
    res.status(200).json(bookings);
  } catch (err) {
    next(err);
  }
}

export async function addBooking(req, res, next) {
  try {
    const booking = await createBooking(req.body);
    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
}

export async function removeBooking(req, res, next) {
  try {
    const { id } = req.params;
    const result = await cancelBooking(id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
