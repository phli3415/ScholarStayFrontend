import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for client-side routing
import './HouseCard.css';

// Function to handle image data conversion
const getImageUrl = (photo) => {
    if (!photo) return null;
    
    if (typeof photo === 'string') {
        if (photo.startsWith('data:')) {
            return photo;
        }
        return `data:image/jpeg;base64,${photo}`;
    }
    
    if (Array.isArray(photo) && photo.length > 0) {
        try {
            const base64String = btoa(String.fromCharCode(...photo));
            return `data:image/jpeg;base64,${base64String}`;
        } catch (error) {
            console.error('Error converting byte array to image:', error);
            return null;
        }
    }
    
    return null;
};


const HouseCard = ({ house }) => {
  // Combine address parts into a single string
  const fullAddress = `${house.street}, ${house.city}`;

  // Determine the display text for the button
  const statusText = house.is_rented ? 'Rented' : 'Available';

  // Get the correct image URL
  const imageUrl = getImageUrl(house.image_data);

  return (
    <div className="house-card">
      <div className="house-card-image">
        {/* Use the getImageUrl function to process the image data */}
        <img src={imageUrl} alt={`View of ${fullAddress}`} />
        <div className={`house-status ${house.is_rented ? 'rented' : 'available'}`}>
          {statusText}
        </div>
      </div>
      <div className="house-card-content">
        <h3 className="house-address">{fullAddress}, {house.province}</h3>
        
        <p className="house-rent">
          ${house.monthly_rent} <span className="rent-period">/ month</span>
        </p>
        
        <div className="house-details-row">
          <span className="house-distance">
            {/* Assuming Font Awesome is available for the icon */}
            <i className="fas fa-university"></i> {house.distance_to_university} to University
          </span>
        </div>

        {house.facilities && house.facilities.length > 0 && (
          <div className="house-facilities">
            <h4>Facilities</h4>
            <ul>
              {house.facilities.map(facility => (
                <li key={facility}>{facility}</li>
              ))}\
            </ul>
          </div>
        )}

        <div className="house-card-footer">
          {/* Correct the link to point to the /property/:id route */}
          <Link to={`/property/${house.id}`} className="details-button">
            More Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HouseCard;
