import 'dotenv/config';
import app from './src/app.js';
import { initDb } from './src/config/database.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`🚀 Meeting Room Booking Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
