import React, { useState, useEffect } from 'react';
import './FilterModal.css';

const FilterModal = ({ isOpen, onClose, onApply, currentFilters }) => {
  const [filters, setFilters] = useState(currentFilters);

  useEffect(() => {
    if (isOpen) {
      setFilters(currentFilters);
    }
  }, [isOpen, currentFilters]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      // For amenities, checking the box means `true`, unchecking means `null` (any).
      if (name === 'has_kitchen' || name === 'has_washer' || name === 'has_parking') {
        setFilters(prev => ({ ...prev, [name]: checked ? true : null }));
      } 
      // For availability, checking means we want `is_rented: false`.
      else if (name === 'is_rented') {
        setFilters(prev => ({ ...prev, [name]: checked ? false : null }));
      }
    } else {
      // For text inputs like max rent and distance.
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onApply(filters);
  };

  const renderCheckbox = (name, label) => (
    <div className="filter-group-checkbox">
      <input
        type="checkbox"
        id={name}
        name={name}
        checked={filters[name] === true}
        onChange={handleChange}
      />
      <label htmlFor={name}>{label}</label>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Advanced Filters</h2>
          <button className="close-icon" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="filter-group">
            <label htmlFor="max_monthly_rent">Max Rent ($)</label>
            <input
              type="number"
              id="max_monthly_rent"
              name="max_monthly_rent"
              placeholder="e.g., 1500"
              value={filters.max_monthly_rent || ''}
              onChange={handleChange}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="max_distance_to_university">Max Distance to University (km)</label>
            <input
              type="number"
              id="max_distance_to_university"
              name="max_distance_to_university"
              placeholder="e.g., 5"
              value={filters.max_distance_to_university || ''}
              onChange={handleChange}
            />
          </div>

          <h4 className="filter-heading">Amenities</h4>
          {renderCheckbox('has_kitchen', 'Kitchen Included')}
          {renderCheckbox('has_washer', 'In-House Laundry')}
          {renderCheckbox('has_parking', 'Parking Available')}

          <h4 className="filter-heading">Availability</h4>
          <div className="filter-group-checkbox">
            <input
              type="checkbox"
              id="is_available_checkbox" // Use a unique id
              name="is_rented" // This checkbox controls the is_rented parameter
              checked={filters.is_rented === false} // It's checked if we are filtering for available (is_rented: false)
              onChange={handleChange}
            />
            <label htmlFor="is_available_checkbox">Only show available properties</label>
          </div>

          <div className="modal-actions">
            <button type="submit" className="apply-button">Apply Filters</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FilterModal;
