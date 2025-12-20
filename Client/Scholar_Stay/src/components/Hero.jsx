import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';
import FilterModal from './FilterModal';

const Hero = () => {
  // Unified state with null as the default for filters
  const [searchParams, setSearchParams] = useState({
    province: '',
    city: '',
    street: '',
    min_monthly_rent: '',
    max_monthly_rent: '',
    max_distance_to_university: '',
    has_kitchen: null, // Default to null (Any)
    has_washer: null,  // Default to null (Any)
    has_parking: null, // Default to null (Any)
    is_rented: null,   // Default to null (Any)
  });
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    const hasAnyFilter = Object.values(searchParams).some(val => val !== '' && val !== null);

    if (!hasAnyFilter) {
      alert('Please enter a location or apply at least one filter.');
      return;
    }

    const queryString = Object.entries(searchParams)
      // Filter out null and empty strings, but keep false values
      .filter(([_, value]) => value !== '' && value !== null)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    navigate(`/search?${queryString}`);
  };

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
