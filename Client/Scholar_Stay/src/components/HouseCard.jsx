
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './HouseCard.css';

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

const HouseCard = ({ house }) => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const checkBookmark = async () => {
      if (session) {
        try {
          const response = await fetch(`http://localhost:8000/bookmarks/check/${house.id}/`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
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
  }, [session, house.id]);

  const handleBookmark = async () => {
    if (!session) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/bookmarks/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
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
      const response = await fetch(`http://localhost:8000/bookmarks/${house.id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
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

  const fullAddress = `${house.street}, ${house.city}`;
  const statusText = house.is_rented ? 'Rented' : 'Available';
  const imageUrl = getImageUrl(house.image_data);

  return (
    <div className="house-card">
      <div className="house-card-image">
        <img src={imageUrl} alt={`View of ${fullAddress}`} />
        <div className={`house-status ${house.is_rented ? 'rented' : 'available'}`}>
          {statusText}
        </div>
      </div>
      <div className="house-card-content">
        <h3 className="house-address">{fullAddress}, {house.province}</h3>
        <p className="house-rent">${house.monthly_rent} <span className="rent-period">/ month</span></p>
        <div className="house-details-row">
          <span className="house-distance">
            <i className="fas fa-university"></i> {house.distance_to_university} km to University
          </span>
        </div>
        {house.facilities && house.facilities.length > 0 && (
          <div className="house-facilities">
            <h4>Facilities</h4>
            <ul>
              {house.facilities.map(facility => (
                <li key={facility}>{facility}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="house-card-footer">
          <Link to={`/property/${house.id}`} className="details-button">More Details</Link>
          {session ? (
            isBookmarked ? (
              <button onClick={handleRemoveBookmark} className="bookmark-button">Remove Bookmark</button>
            ) : (
              <button onClick={handleBookmark} className="bookmark-button">Add Bookmark</button>
            )
          ) : (
            <button onClick={() => navigate('/login')} className="bookmark-button">Login to Add Bookmark</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HouseCard;
