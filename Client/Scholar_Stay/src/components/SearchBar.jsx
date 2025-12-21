import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './SearchBar.css';
import FilterModal from './FilterModal';

const SearchBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getInitialParams = () => {
    const params = new URLSearchParams(location.search);
    return {
      province: params.get('province') || '',
      city: params.get('city') || '',
      street: params.get('street') || '',
      min_monthly_rent: params.get('min_monthly_rent') || '',
      max_monthly_rent: params.get('max_monthly_rent') || '',
      max_distance_to_university: params.get('max_distance_to_university') || '',
      has_kitchen: params.get('has_kitchen') === 'true' ? true : (params.get('has_kitchen') === 'false' ? false : null),
      has_washer: params.get('has_washer') === 'true' ? true : (params.get('has_washer') === 'false' ? false : null),
      has_parking: params.get('has_parking') === 'true' ? true : (params.get('has_parking') === 'false' ? false : null),
      is_rented: params.get('is_rented') === 'true' ? true : (params.get('is_rented') === 'false' ? false : null),
    };
  };

  const [searchParams, setSearchParams] = useState(getInitialParams);
  const [showFilters, setShowFilters] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    const queryString = Object.entries(searchParams)
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
    <div className="search-bar-container">
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
      <FilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleApplyFilters}
        currentFilters={searchParams}
      />
    </div>
  );
};

export default SearchBar;
