import React, { useState } from 'react';

export default function BookingForm({ rooms, onBookingCreated, initialData = null }) {
  const todayStr = new Date().toISOString().substring(0, 10);

  const [roomId, setRoomId] = useState(initialData?.roomId || (rooms[0]?.id || ''));
  const [title, setTitle] = useState('');
  const [organizerEmail, setOrganizerEmail] = useState('');
  const [attendees, setAttendees] = useState(2);
  const [date, setDate] = useState(initialData?.date || todayStr);
  const [startTime, setStartTime] = useState(initialData?.start || '10:00');
  const [endTime, setEndTime] = useState(initialData?.end || '11:00');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [errorCode, setErrorCode] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Generate 15-minute time options between 08:00 and 20:00 UTC
  const timeOptions = [];
  for (let h = 8; h <= 20; h++) {
    for (let m = 0; m < 60; m += 15) {
      if (h === 20 && m > 0) break;
      const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      timeOptions.push(timeStr);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setErrorCode(null);
    setSuccessMessage(null);

    if (!title.trim()) {
      setErrorMessage('Title is required (1 to 100 characters).');
      return;
    }

    const startIso = `${date}T${startTime}:00Z`;
    const endIso = `${date}T${endTime}:00Z`;

    const payload = {
      roomId: Number(roomId),
      title: title.trim(),
      organizerEmail: organizerEmail.trim(),
      attendees: Number(attendees),
      start: startIso,
      end: endIso
    };

    try {
      setSubmitting(true);
      await onBookingCreated(payload);
      setSuccessMessage('Booking created successfully!');
      setTitle('');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create booking.');
      setErrorCode(err.code || 'ERROR');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedRoom = rooms.find(r => r.id === Number(roomId));

  return (
    <div className="form-container glass-card animate-fade-in">
      <div className="form-header">
        <div>
          <h2>Create Meeting Room Booking</h2>
          <p className="subtitle">All times are evaluated in UTC time standard</p>
        </div>
      </div>

      {errorMessage && (
        <div className="error-alert">
          <div>
            <strong>{errorCode ? `Rule Violation [${errorCode}]` : 'Booking Error'}</strong>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="success-alert">
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="booking-form">
        {/* Room Selection */}
        <div className="form-group">
          <label htmlFor="formRoomId" className="form-label">
            <span>Select Meeting Room *</span>
          </label>
          <select 
            id="formRoomId"
            value={roomId} 
            onChange={(e) => setRoomId(e.target.value)} 
            className="input-field"
            required
          >
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} (Max Capacity: {r.capacity} | Floor {r.floor})
              </option>
            ))}
          </select>
          {selectedRoom && (
            <span className="field-hint">Max capacity: {selectedRoom.capacity} seats ({selectedRoom.amenities})</span>
          )}
        </div>

        {/* Title */}
        <div className="form-group">
          <label htmlFor="formTitle" className="form-label">
            <span>Meeting Title *</span>
          </label>
          <input 
            id="formTitle"
            type="text" 
            placeholder="e.g. Sprint Planning Sync" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            required 
            maxLength={100}
          />
        </div>

        {/* Organizer Email */}
        <div className="form-group">
          <label htmlFor="formEmail" className="form-label">
            <span>Organizer Email *</span>
          </label>
          <input 
            id="formEmail"
            type="email" 
            placeholder="e.g. sam@example.com" 
            value={organizerEmail} 
            onChange={(e) => setOrganizerEmail(e.target.value)}
            className="input-field"
            required 
          />
        </div>

        {/* Attendees */}
        <div className="form-group">
          <label htmlFor="formAttendees" className="form-label">
            <span>Number of Attendees *</span>
          </label>
          <input 
            id="formAttendees"
            type="number" 
            value={attendees} 
            onChange={(e) => setAttendees(e.target.value)}
            className="input-field"
            min={1} 
            max={selectedRoom ? selectedRoom.capacity : 50}
            required 
          />
        </div>

        {/* Date */}
        <div className="form-group">
          <label htmlFor="formDate" className="form-label">
            <span>Date (UTC) *</span>
          </label>
          <input 
            id="formDate"
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            className="input-field"
            required 
          />
        </div>

        {/* Time Window */}
        <div className="form-row-2">
          <div className="form-group">
            <label htmlFor="formStart" className="form-label">
              <span>Start Time (UTC) *</span>
            </label>
            <select 
              id="formStart"
              value={startTime} 
              onChange={(e) => setStartTime(e.target.value)}
              className="input-field"
              required
            >
              {timeOptions.slice(0, -1).map((t) => (
                <option key={t} value={t}>{t} UTC</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="formEnd" className="form-label">
              <span>End Time (UTC) *</span>
            </label>
            <select 
              id="formEnd"
              value={endTime} 
              onChange={(e) => setEndTime(e.target.value)}
              className="input-field"
              required
            >
              {timeOptions.slice(1).map((t) => (
                <option key={t} value={t}>{t} UTC</option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" disabled={submitting} className="btn btn-primary btn-submit">
          {submitting ? 'Verifying & Creating...' : 'Submit Booking Request'}
        </button>
      </form>
    </div>
  );
}
