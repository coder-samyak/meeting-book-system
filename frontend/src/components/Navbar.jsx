import React from 'react';

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <header className="navbar">
      <div className="navbar-brand">
        <div className="brand-titles">
          <span className="brand-name">BookSpace <span className="utc-pill">UTC</span></span>
          <span className="brand-subtitle">Meeting Room Booking System</span>
        </div>
      </div>

      <nav className="navbar-tabs">
        <button 
          onClick={() => setActiveTab('dayview')}
          className={`tab-btn ${activeTab === 'dayview' ? 'active' : ''}`}
        >
          <span>Schedule Day View</span>
        </button>

        <button 
          onClick={() => setActiveTab('newbooking')}
          className={`tab-btn ${activeTab === 'newbooking' ? 'active' : ''}`}
        >
          <span>New Booking</span>
        </button>

        <button 
          onClick={() => setActiveTab('availability')}
          className={`tab-btn ${activeTab === 'availability' ? 'active' : ''}`}
        >
          <span>Find Available Room</span>
        </button>
      </nav>

      <div className="utc-clock-badge">
        <span>All times in UTC</span>
      </div>
    </header>
  );
}
