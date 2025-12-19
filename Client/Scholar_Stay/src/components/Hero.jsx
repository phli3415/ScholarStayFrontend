import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';
import FilterModal from './FilterModal';

const Hero = () => {
  const [city, setCity] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    min_rent: '',
    max_rent: '',
    max_distance: '',
    has_kitchen: false,
    has_washer: false,
    has_parking: false,
    is_rented: false,
  });

  const navigate = useNavigate();

  const handleSearch = () => {
    if (!city) {
      alert('Please enter a city to start your search.');
      return;
    }

    let queryString = `?city=${encodeURIComponent(city)}`;

    for (const [key, value] of Object.entries(filters)) {
      if (value) {
        queryString += `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      }
    }

    navigate(`/search${queryString}`);
  };

  const handleApplyFilters = (appliedFilters) => {
    setFilters(appliedFilters);
    setShowFilters(false);
  };

  return (
    <div className="hero-container">
      <div className="hero-content">
        <h1>Find Your Perfect College Stay</h1>
        <p>Find your perfect UMass home base with AI-powered matching. Experience seamless student living with local hosts and smart technology tailored to you.</p>
        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Enter a city (e.g., Amherst, Northampton)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="filter-button" onClick={() => setShowFilters(true)}>
            Filters
          </button>
          <button className="search-button" onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>
      <FilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleApplyFilters}
        currentFilters={filters}
      />
    </div>
  );
};

export default Hero;
