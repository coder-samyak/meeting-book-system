import React from 'react';

export default function DayView({ 
  rooms, 
  bookings, 
  selectedDate, 
  setSelectedDate, 
  selectedRoomId, 
  setSelectedRoomId, 
  loading, 
  error, 
  onCancelRequest 
}) {
  const formatTimeStr = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const h = date.getUTCHours().toString().padStart(2, '0');
    const m = date.getUTCMinutes().toString().padStart(2, '0');
    return `${h}:${m} UTC`;
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = months[parseInt(month, 10) - 1] || month;
    return `${day} ${monthName} ${year}`;
  };

  const filteredRooms = selectedRoomId
    ? rooms.filter(r => r.id === Number(selectedRoomId))
    : rooms;

  return (
    <div className="dayview-container animate-fade-in">
      {/* Date & Filter Controls */}
      <div className="filter-card">
        <div className="filter-group">
          <label htmlFor="datePicker" className="filter-label">
            <span>Select Date (UTC):</span>
          </label>
          <input 
            id="datePicker"
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input-field date-input"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="roomFilter" className="filter-label">Filter by Room:</label>
          <select 
            id="roomFilter"
            value={selectedRoomId} 
            onChange={(e) => setSelectedRoomId(e.target.value)}
            className="input-field select-input"
          >
            <option value="">All Rooms ({rooms.length})</option>
            {rooms.map(r => (
              <option key={r.id} value={r.id}>{r.name} (Cap: {r.capacity})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <p>Fetching bookings for {formatDateDisplay(selectedDate)} (UTC)...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="error-banner">
          <span>{error}</span>
        </div>
      )}

      {/* Rooms Schedule Grid */}
      {!loading && (
        <div className="rooms-grid">
          {filteredRooms.map((room) => {
            const roomBookings = bookings.filter(b => b.roomId === room.id);

            return (
              <div key={room.id} className="room-card">
                <div className="room-card-header">
                  <div className="room-header-main">
                    <h3 className="room-title">{room.name}</h3>
                    <span className="capacity-badge">
                      <span>{room.capacity} seats</span>
                    </span>
                  </div>
                  <div className="room-meta">
                    <span className="meta-item">
                      <span>Floor {room.floor}</span>
                    </span>
                    <span className="meta-item">
                      <span>{room.amenities}</span>
                    </span>
                  </div>
                </div>

                {/* Room Bookings Section */}
                <div className="room-bookings-section">
                  <div className="section-header-box">
                    <h4 className="bookings-section-title">
                      Bookings for {formatDateDisplay(selectedDate)} (UTC)
                    </h4>
                    <span className="business-hours-tag">
                      <span>Business hours: 08:00 – 20:00 UTC</span>
                    </span>
                  </div>

                  {roomBookings.length === 0 ? (
                    <div className="empty-bookings">
                      <span>No confirmed bookings scheduled for this date.</span>
                    </div>
                  ) : (
                    <div className="bookings-list">
                      {roomBookings.map((b) => (
                        <div key={b.id} className="booking-card">
                          <div className="booking-card-top">
                            <h5 className="booking-title">{b.title}</h5>
                            <span className="status-badge-confirmed">
                              <span>Confirmed</span>
                            </span>
                          </div>

                          <span className="booking-time-range font-mono">
                            {formatTimeStr(b.start)} – {formatTimeStr(b.end)}
                          </span>

                          <div className="booking-sub-info">
                            <span className="organizer-email">{b.organizerEmail}</span>
                            <span className="attendees-count">{b.attendees} attendees</span>
                          </div>

                          <button 
                            onClick={() => onCancelRequest(b)} 
                            className="btn btn-cancel-sm"
                            title="Cancel Booking"
                          >
                            <span>Cancel</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
