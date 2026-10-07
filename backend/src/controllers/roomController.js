import { getAllRooms } from '../services/bookingService.js';

export async function getRooms(req, res, next) {
  try {
    const rooms = await getAllRooms();
    res.status(200).json(rooms);
  } catch (err) {
    next(err);
  }
}
