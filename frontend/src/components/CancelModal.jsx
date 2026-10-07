import React from 'react';

export default function CancelModal({ booking, onClose, onConfirm, cancelling }) {
  if (!booking) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title text-danger">
            <span>Cancel Booking?</span>
          </div>
          <button onClick={onClose} className="icon-btn" aria-label="Close modal">
            &times;
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-warning-text">
            Are you sure you want to cancel <strong>"{booking.title}"</strong>?
          </p>
          <div className="booking-summary-box">
            <p><strong>Organizer:</strong> {booking.organizerEmail}</p>
            <p><strong>Time (UTC):</strong> {new Date(booking.start).toUTCString()}</p>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} disabled={cancelling} className="btn btn-secondary">
            Keep Booking
          </button>
          <button onClick={() => onConfirm(booking.id)} disabled={cancelling} className="btn btn-danger">
            <span>{cancelling ? 'Cancelling...' : 'Cancel Booking'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
