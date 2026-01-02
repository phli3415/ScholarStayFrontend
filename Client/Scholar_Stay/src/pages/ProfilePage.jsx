
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './PropertyPage.css';

const base_url = "http://127.0.0.1:8000/api/v1/";

const getImageUrl = (photo) => {
    if (!photo) return null;
    if (typeof photo === 'string') {
        if (photo.startsWith('data:')) return photo;
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

const PropertyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const fetchHouseDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${base_url}houses/${id}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.detail || `Failed to fetch property: ${response.statusText}`);
        }
        const data = await response.json();
        setHouse(data);
      } catch (err) {
        console.error("Error fetching house details:", err);
        setError(err.message || 'Could not load property details.');
      } finally {
        setLoading(false);
      }
    };

    fetchHouseDetails();
  }, [id]);

  useEffect(() => {
    const checkBookmark = async () => {
      if (session && house) {
        try {
          const response = await fetch(`${base_url}bookmarks/check/${house.id}/`, {
            headers: {
              'Authorization': `Bearer ${session.token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setIsBookmarked(data.is_bookmarked);
          } else {
            console.error('Failed to check bookmark status');
          }
        } catch (error) {
          console.error('Error checking bookmark status:', error);
        }
      }
    };

    checkBookmark();
  }, [session, house]);

  const handleBookmark = async () => {
    if (!session) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${base_url}bookmarks/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`,
        },
        body: JSON.stringify({ house_id: house.id }),
      });

      if (response.ok) {
        setIsBookmarked(true);
      } else {
        console.error('Failed to add bookmark');
      }
    } catch (error) {
      console.error('Error adding bookmark:', error);
    }
  };

  const handleRemoveBookmark = async () => {
    if (!session) return;

    try {
      const response = await fetch(`${base_url}bookmarks/by-house/${house.id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.token}`,
        },
      });

      if (response.ok) {
        setIsBookmarked(false);
      } else {
        console.error('Failed to remove bookmark');
      }
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  if (loading) {
    return <div className="property-container status-message"><h2>Loading Property...</h2></div>;
  }

  if (error) {
    return <div className="property-container status-message error-message"><h2>Error: {error}</h2></div>;
  }

  if (!house) {
    return <div className="property-container"><h2>Property not found.</h2></div>;
  }

  const imageUrl = getImageUrl(house.image_data);

  return (
    <div className="property-container">
      <div className="property-card">
        <div className="property-header">
          <button onClick={() => navigate(-1)} className="back-button">
            &larr; Back to Search
          </button>
          {session && session.user? (
            isBookmarked ? (
              <button onClick={handleRemoveBookmark} className="bookmark-button">Remove Bookmark</button>
            ) : (
              <button onClick={handleBookmark} className="bookmark-button">Add Bookmark</button>
            )
          ) : (
            <button onClick={() => navigate('/login')} className="bookmark-button">Login to Add Bookmark</button>
          )}
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
          <h2 classNameS="section-title">Description</h2>
          <p>{house.description}</p>
        </div>

      </div>
    </div>
  );
};

export default PropertyPage;
