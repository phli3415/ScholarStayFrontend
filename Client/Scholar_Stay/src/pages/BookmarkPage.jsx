import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import HouseCard from '../components/HouseCard'; // Assuming HouseCard is reusable
import { API_BASE_URL } from '../config';
import './BookmarkPage.css';

const base_url = `${API_BASE_URL}/`;

const BookmarksPage = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { session } = useAuth();

  useEffect(() => {
    if (!session || !session.token) {
      setLoading(false);
      return;
    }

    const fetchBookmarks = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${base_url}bookmarks/me`, {
          headers: {
            'Authorization': `Bearer ${session.token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch bookmarks. Please refresh the webpage.');
        }

        const data = await response.json();
        setBookmarks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [session]);

  const handleRemoveBookmark = (houseId) => {
    setBookmarks(prev => prev.filter(bookmark => bookmark.house.id !== houseId));
  };

  if (!session || !session.token) {
    return (
      <div className="bookmarks-page-container">
        <div className="locked-container">
          <p className="locked-message">This feature requires you to be logged in.</p>
          <Link to="/login" className="locked-login-link">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bookmarks-page-container">
      <div className="bookmarks-header">
        <h1>My Bookmarks</h1>
        <p>Your saved properties for future reference.</p>
      </div>

      {loading && <p className="loading-text">Loading your bookmarks...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        bookmarks.length > 0 ? (
          <div className="bookmarks-grid">
            {bookmarks.map(bookmark => (
              <HouseCard key={bookmark.house.id} house={bookmark.house}/>
            ))}
          </div>
        ) : (
          <p className="no-bookmarks-text">You haven't bookmarked any properties yet.</p>
        )
      )}
    </div>
  );
};

export default BookmarksPage;
