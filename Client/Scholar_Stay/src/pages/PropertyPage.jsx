import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PropertyPage.css';

// Function to handle image data conversion
const getImageUrl = (photo) => {
    if (!photo) return "https://via.placeholder.com/1260x750.png?text=No+Image+Available";

    if (typeof photo === 'string') {
        return photo.startsWith('data:') ? photo : `data:image/jpeg;base64,${photo}`;
    }

    if (Array.isArray(photo) && photo.length > 0) {
        try {
            const base64String = btoa(String.fromCharCode.apply(null, new Uint8Array(photo)));
            return `data:image/jpeg;base64,${base64String}`;
        } catch (error) {
            console.error('Error converting byte array to image:', error);
            return "https://via.placeholder.com/1260x750.png?text=Image+Load+Error";
        }
    }
    
    return "https://via.placeholder.com/1260x750.png?text=Unsupported+Format";
};

const PropertyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHouseDetails = async () => {
      setLoading(true);
      try {
        // Fetching data from your live backend
        const API_URL = `http://127.0.0.1:8000/api/v1/houses/${id}`;
        const response = await fetch(API_URL);

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.detail || `Failed to fetch property: ${response.statusText}`);
        }

        const data = await response.json();
        setHouse(data);
      } catch (err) {
        console.error("Error fetching house details:", err);
        setError(err.message || 'Could not load property details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchHouseDetails();
  }, [id]);

  if (loading) {
    return <div className="property-container status-message"><h2>Loading Property...</h2></div>;
  }

  if (error) {
    return <div className="property-container status-message error-message"><h2>Error: {error}</h2></div>;
  }

  if (!house) {
    return <div className="property-container"><h2>Property not found.</h2></div>;
  }

  const imageUrl = getImageUrl(house.image);

  return (
    <div className="property-container">
      <div className="property-card">
        <div className="property-header">
          <button onClick={() => navigate(-1)} className="back-button">
            &larr; Back to Search
          </button>
          <button className="bookmark-button">Log in to Bookmark</button>
        </div>

        <h1 className="property-title">{house.street}, {house.city}</h1>

        <div className="property-image">
          <img src={imageUrl} alt={`View of ${house.street}`} />
        </div>

        <div className="property-details-grid">
          <div><strong>Apartment No:</strong> {house.house_number}</div>
          <div><strong>Landlord's Phone:</strong> {house.landlord_phone_number || 'N/A'}</div>
          <div><strong>Rent per Month:</strong> ${house.monthly_rent.toFixed(2)}</div>
          <div><strong>Distance from Campus:</strong> {house.distance_to_university} km</div>
          <div><strong>Province:</strong> {house.province}</div>
          <div><strong>City:</strong> {house.city}</div>
        </div>

        <div className="property-section">
          <h2 className="section-title">Amenities</h2>
          <ul className="amenities-list">
            <li>
              Kitchen: 
              <span className={house.has_kitchen ? 'available' : 'not-available'}>
                {house.has_kitchen ? 'Available' : 'Not Available'}
              </span>
            </li>
            <li>
              Laundry/Drying: 
              <span className={house.has_washer ? 'available' : 'not-available'}>
                {house.has_washer ? 'Available' : 'Not Available'}
              </span>
            </li>
            <li>
              Parking: 
              <span className={house.has_parking ? 'available' : 'not-available'}>
                {house.has_parking ? 'Available' : 'Not Available'}
              </span>
            </li>
          </ul>
        </div>

        <div className="property-section">
          <h2 className="section-title">Description</h2>
          <p>{house.description}</p>
        </div>

      </div>
    </div>
  );
};

export default PropertyPage;
