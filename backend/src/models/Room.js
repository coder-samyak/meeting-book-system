import { query, get, run } from '../config/database.js';

export const Room = {
  async findAll() {
    return await query('SELECT * FROM rooms ORDER BY id ASC');
  },

  async findById(id) {
    return await get('SELECT * FROM rooms WHERE id = ?', [id]);
  },

  async findAvailableByCapacity(minCapacity) {
    return await query(
      'SELECT * FROM rooms WHERE capacity >= ? ORDER BY capacity ASC',
      [Number(minCapacity)]
    );
  }
};
