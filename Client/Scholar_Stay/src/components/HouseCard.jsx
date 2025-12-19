import React from 'react';
import './HouseCard.css';

// A mapping for boolean values to display friendly text
const facilityText = {
  has_kitchen: 'Kitchen',
  has_washer: 'Washer',
  has_parking: 'Parking',
};

const HouseCard = ({ house }) => {
  // Extracting address details with fallbacks for safety
  const address = house.address || {};
  const fullAddress = `${address.street}, ${address.city}, ${address.province}`;

  // Find which facilities are available
  const availableFacilities = Object.keys(facilityText)
    .filter(key => house[key])
    .map(key => facilityText[key]);

  return (
    <div className="house-card">
      <div className="house-card-image">
        {/* Placeholder for an image. You can replace this with a real image if available in your data. */}
        <img src="https://via.placeholder.com/400x250.png?text=Home+Image" alt={`View of ${fullAddress}`} />
        <div className={`house-status ${house.is_rented ? 'rented' : 'available'}`}>
          {house.is_rented ? 'Rented' : 'Available'}
        </div>
      </div>
      <div className="house-card-content">
        <h3 className="house-address">{fullAddress}</h3>
        
        <p className="house-rent">
          ${house.monthly_rent} <span className="rent-period">/ month</span>
        </p>
        
        <div className="house-details-row">
          <span className="house-distance">
            <i className="fas fa-university"></i> {house.distance_to_university_km} km to University
          </span>
        </div>

        {availableFacilities.length > 0 && (
          <div className="house-facilities">
            <h4>Facilities</h4>
            <ul>
              {availableFacilities.map(facility => (
                <li key={facility}>{facility}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="house-card-footer">
          <a href={`/house/${house.id}`} className="details-button">More Details</a>
        </div>
      </div>
    </div>
  );
};

export default HouseCard;
