import { searchAvailability } from '../services/bookingService.js';

export async function checkAvailability(req, res, next) {
  try {
    const { date, start, end, minCapacity } = req.query;
    const rooms = await searchAvailability({ date, start, end, minCapacity });
    res.status(200).json(rooms);
  } catch (err) {
    next(err);
  }
}
