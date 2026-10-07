import { Router } from 'express';
import { listBookings, addBooking, removeBooking } from '../controllers/bookingController.js';

const router = Router();

router.get('/', listBookings);
router.post('/', addBooking);
router.delete('/:id', removeBooking);

export default router;
