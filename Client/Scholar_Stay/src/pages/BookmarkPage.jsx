
import React, { useState, useEffect } from 'react';
import HouseCard from '../components/HouseCard';
import { useAuth } from '../contexts/AuthContext';
import './BookmarkPage.css';

const BookmarkPage = () => {
  const [bookmarkedHouses, setBookmarkedHouses] = useState([]);
  const { session } = useAuth();

  useEffect(() => {
    const fetchBookmarkedHouses = async () => {
      if (session) {
        try {
          const response = await fetch('http://localhost:8000/bookmarks/me/', {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setBookmarkedHouses(data);
          } else {
            console.error('Failed to fetch bookmarked houses');
          }
        } catch (error) {
          console.error('Error fetching bookmarked houses:', error);
        }
      }
    };

    fetchBookmarkedHouses();
  }, [session]);

  return (
    <div className="bookmark-page">
      <h1>My Bookmarked Houses</h1>
      <div className="house-list">
        {bookmarkedHouses.length > 0 ? (
          bookmarkedHouses.map((house) => (
            <HouseCard key={house.id} house={house} />
          ))
        ) : (
          <p>You have no bookmarked houses.</p>
        )}
      </div>
    </div>
  );
};

export default BookmarkPage;
