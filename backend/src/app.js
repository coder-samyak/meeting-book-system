import express from 'express';
import cors from 'cors';
import roomRoutes from './routes/roomRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import availabilityRoutes from './routes/availabilityRoutes.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/availability', availabilityRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Meeting Room Booking API is running.' });
});

app.use(errorHandler);

export default app;
