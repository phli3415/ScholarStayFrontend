import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';
import FilterModal from './FilterModal';

const Hero = () => {
  // Unified state for all search and filter parameters
  const [searchParams, setSearchParams] = useState({
    province: '',
    city: '',
    street: '',
    min_monthly_rent: '',
    max_monthly_rent: '',
    max_distance_to_university: '',
    has_kitchen: false,
    has_washer: false,
    has_parking: false,
    is_rented: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  // A single handler for all input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    const primarySearchKeys = ['province', 'city', 'street'];
    const hasPrimarySearch = primarySearchKeys.some(key => !!searchParams[key]);

    if (!hasPrimarySearch) {
      alert('Please enter a Province, City, or Street to begin.');
      return;
    }

    const queryString = Object.entries(searchParams)
      .filter(([_, value]) => value) // Filter out empty/false values
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    navigate(`/search?${queryString}`);
  };

  // This function will be passed to the modal
  const handleApplyFilters = (appliedFilters) => {
    setSearchParams(prev => ({ ...prev, ...appliedFilters }));
    setShowFilters(false);
  };

  return (
    <div className="hero-container">
      <div className="hero-content">
        <h1>Find Your Next Stay</h1>
        <p>Find your perfect UMass home base with AI-powered matching. Experience seamless student living with local hosts and smart technology tailored to you.</p>
        <div className="search-bar">
            <div className="search-inputs-container">
                <input
                    type="text"
                    name="province"
                    className="search-input"
                    placeholder="Province"
                    value={searchParams.province}
                    onChange={handleInputChange}
                />
                <div className="input-separator"></div>
                <input
                    type="text"
                    name="city"
                    className="search-input"
                    placeholder="City"
                    value={searchParams.city}
                    onChange={handleInputChange}
                />
                <div className="input-separator"></div>
                <input
                    type="text"
                    name="street"
                    className="search-input"
                    placeholder="Street"
                    value={searchParams.street}
                    onChange={handleInputChange}
                />
            </div>
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
        currentFilters={searchParams}
      />
    </div>
  );
};

export default Hero;
