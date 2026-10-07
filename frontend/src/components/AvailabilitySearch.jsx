import React, { useState } from 'react';
import { searchAvailabilityApi } from '../services/api';

export default function AvailabilitySearch({ onSelectRoomForBooking }) {
  const todayStr = new Date().toISOString().substring(0, 10);

  const [date, setDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [minCapacity, setMinCapacity] = useState(4);

  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Time options 08:00 to 20:00 UTC
  const timeOptions = [];
  for (let h = 8; h <= 20; h++) {
    for (let m = 0; m < 60; m += 15) {
      if (h === 20 && m > 0) break;
      const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      timeOptions.push(timeStr);
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault();
    setError(null);
    setSearching(true);
    setResults(null);

    try {
      const rooms = await searchAvailabilityApi({
        date,
        start: startTime,
        end: endTime,
        minCapacity
      });
      setResults(rooms);
    } catch (err) {
      setError(err.message || 'Failed to search available rooms.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="availability-search-container animate-fade-in">
      <div className="glass-card form-card">
        <div className="form-header">
          <div>
            <h2>Find Available Meeting Rooms</h2>
            <p className="subtitle">Searches rooms matching capacity and window, ordered by best fit</p>
          </div>
        </div>

        {error && (
          <div className="error-alert">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSearch} className="availability-form">
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="availDate" className="form-label">
                <span>Date (UTC) *</span>
              </label>
              <input 
                id="availDate"
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                className="input-field" 
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="availCapacity" className="form-label">
                <span>Minimum Capacity *</span>
              </label>
              <input 
                id="availCapacity"
                type="number" 
                value={minCapacity} 
                onChange={(e) => setMinCapacity(e.target.value)} 
                className="input-field" 
                min={1} 
                required 
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="availStart" className="form-label">
                <span>Start Time (UTC) *</span>
              </label>
              <select 
                id="availStart"
                value={startTime} 
                onChange={(e) => setStartTime(e.target.value)} 
                className="input-field"
              >
                {timeOptions.slice(0, -1).map(t => (
                  <option key={t} value={t}>{t} UTC</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="availEnd" className="form-label">
                <span>End Time (UTC) *</span>
              </label>
              <select 
                id="availEnd"
                value={endTime} 
                onChange={(e) => setEndTime(e.target.value)} 
                className="input-field"
              >
                {timeOptions.slice(1).map(t => (
                  <option key={t} value={t}>{t} UTC</option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" disabled={searching} className="btn btn-primary btn-submit">
            {searching ? 'Checking Availability...' : 'Search Free Rooms'}
          </button>
        </form>
      </div>

      {/* Results List */}
      {results && (
        <div className="results-container mt-24">
          <h3 className="results-title">
            Available Rooms ({results.length} found for {date} {startTime}–{endTime} UTC):
          </h3>

          {results.length === 0 ? (
            <div className="empty-state glass-card">
              <p>No meeting rooms are available for the selected time window and capacity.</p>
            </div>
          ) : (
            <div className="results-grid">
              {results.map((room, index) => (
                <div key={room.id} className="glass-card available-room-card">
                  <div className="room-badge-row">
                    {index === 0 && <span className="best-fit-badge">Best Fit</span>}
                    <span className="room-name">{room.name}</span>
                  </div>

                  <div className="room-details">
                    <span className="detail-pill">
                      <span>Capacity: {room.capacity} seats</span>
                    </span>
                    <span className="detail-pill">
                      <span>Floor {room.floor}</span>
                    </span>
                    <span className="detail-pill">
                      <span>{room.amenities}</span>
                    </span>
                  </div>

                  <button 
                    onClick={() => onSelectRoomForBooking({ roomId: room.id, date, start: startTime, end: endTime })}
                    className="btn btn-primary btn-book-now"
                  >
                    <span>Book This Room &rarr;</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
