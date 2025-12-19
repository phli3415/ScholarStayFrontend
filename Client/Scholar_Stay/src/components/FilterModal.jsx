import React, { useState, useEffect } from 'react';
import './FilterModal.css';

const FilterModal = ({ isOpen, onClose, onApply, currentFilters }) => {
  const [filters, setFilters] = useState(currentFilters);

  useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleApply = () => {
    onApply(filters);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Filter Options</h2>
        
        <div className="filter-group">
          <label>Rent (Monthly)</label>
          <div className="input-row">
            <input type="number" name="min_rent" placeholder="Min Rent" value={filters.min_rent} onChange={handleChange} className="filter-input" />
            <input type="number" name="max_rent" placeholder="Max Rent" value={filters.max_rent} onChange={handleChange} className="filter-input" />
          </div>
        </div>

        <div className="filter-group">
          <label htmlFor="max_distance">Max Distance to University (km)</label>
          <input type="number" id="max_distance" name="max_distance" placeholder="e.g., 2.5" value={filters.max_distance} onChange={handleChange} className="filter-input" />
        </div>

        <div className="filter-group">
          <label>Facilities</label>
          <div className="checkbox-group">
            <label><input type="checkbox" name="has_kitchen" checked={filters.has_kitchen} onChange={handleChange} /> Kitchen</label>
            <label><input type="checkbox" name="has_washer" checked={filters.has_washer} onChange={handleChange} /> Washer</label>
            <label><input type="checkbox" name="has_parking" checked={filters.has_parking} onChange={handleChange} /> Parking</label>
          </div>
        </div>

        <div className="filter-group">
          <label>Status</label>
          <div className="checkbox-group">
            <label><input type="checkbox" name="is_rented" checked={filters.is_rented} onChange={handleChange} /> Include Rented</label>
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleApply} className="btn-primary">Apply Filters</button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
