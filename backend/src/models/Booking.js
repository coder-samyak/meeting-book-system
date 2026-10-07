import { query, get, run } from '../config/database.js';

export const Booking = {
  async findConfirmedByDateAndRoom({ date, roomId }) {
    let sql = "SELECT b.*, r.name as roomName FROM bookings b JOIN rooms r ON b.roomId = r.id WHERE b.status = 'confirmed'";
    const params = [];

    if (date) {
      sql += " AND date(b.start) = date(?)";
      params.push(date);
    }

    if (roomId) {
      sql += " AND b.roomId = ?";
      params.push(roomId);
    }

    sql += " ORDER BY b.start ASC";
    return await query(sql, params);
  },

  async findById(id) {
    return await get('SELECT * FROM bookings WHERE id = ?', [id]);
  },

  async findConfirmedByRoomId(roomId) {
    return await query(
      "SELECT * FROM bookings WHERE roomId = ? AND status = 'confirmed'",
      [roomId]
    );
  },

  async findConfirmedByOrganizerAndDate(organizerEmail, dateStr) {
    return await query(
      `SELECT * FROM bookings 
       WHERE organizerEmail = ? 
       AND status = 'confirmed' 
       AND date(start) = date(?)`,
      [organizerEmail, dateStr]
    );
  },

  async create({ roomId, title, organizerEmail, attendees, start, end, createdAt }) {
    const result = await run(
      `INSERT INTO bookings (roomId, title, organizerEmail, attendees, start, end, status, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, 'confirmed', ?)`,
      [roomId, title, organizerEmail, Number(attendees), start, end, createdAt]
    );
    return await this.findById(result.id);
  },

  async updateStatus(id, status) {
    await run("UPDATE bookings SET status = ? WHERE id = ?", [status, id]);
    return await this.findById(id);
  }
};
