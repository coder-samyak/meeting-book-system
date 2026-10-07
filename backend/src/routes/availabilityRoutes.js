import { Router } from 'express';
import { checkAvailability } from '../controllers/availabilityController.js';

const router = Router();

router.get('/', checkAvailability);

export default router;
