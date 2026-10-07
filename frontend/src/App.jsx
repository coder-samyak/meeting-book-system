import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import DayView from './components/DayView';
import BookingForm from './components/BookingForm';
import AvailabilitySearch from './components/AvailabilitySearch';
import CancelModal from './components/CancelModal';
import { fetchRooms, fetchBookings, createBooking, cancelBookingApi } from './services/api';
import './App.css';

export default function App() {
  const todayStr = new Date().toISOString().substring(0, 10);

  const [activeTab, setActiveTab] = useState('dayview');
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedRoomId, setSelectedRoomId] = useState('');

  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [bookingPrefill, setBookingPrefill] = useState(null);

  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    async function loadRooms() {
      try {
        const roomsData = await fetchRooms();
        setRooms(roomsData);
      } catch (err) {
        setError(err.message || 'Failed to load meeting rooms.');
      }
    }
    loadRooms();
  }, []);

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchBookings(selectedDate, selectedRoomId);
      setBookings(data);
    } catch (err) {
      setError(err.message || 'Failed to load room bookings.');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedRoomId]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleBookingCreated = async (payload) => {
    const result = await createBooking(payload);
    await loadBookings();
    setSelectedDate(payload.start.substring(0, 10));
    setActiveTab('dayview');
    return result;
  };

  const handleConfirmCancel = async (bookingId) => {
    try {
      setIsCancelling(true);
      await cancelBookingApi(bookingId);
      setCancellingBooking(null);
      await loadBookings();
    } catch (err) {
      alert(err.message || 'Failed to cancel booking.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSelectRoomForBooking = (prefill) => {
    setBookingPrefill(prefill);
    setActiveTab('newbooking');
  };

  return (
    <div className="app-layout">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content">
        {activeTab === 'dayview' && (
          <DayView 
            rooms={rooms}
            bookings={bookings}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedRoomId={selectedRoomId}
            setSelectedRoomId={setSelectedRoomId}
            loading={loading}
            error={error}
            onCancelRequest={(b) => setCancellingBooking(b)}
          />
        )}

        {activeTab === 'newbooking' && (
          <BookingForm 
            rooms={rooms} 
            onBookingCreated={handleBookingCreated}
            initialData={bookingPrefill}
          />
        )}

        {activeTab === 'availability' && (
          <AvailabilitySearch 
            onSelectRoomForBooking={handleSelectRoomForBooking}
          />
        )}
      </main>

      <CancelModal 
        booking={cancellingBooking}
        onClose={() => setCancellingBooking(null)}
        onConfirm={handleConfirmCancel}
        cancelling={isCancelling}
      />
    </div>
  );
}
