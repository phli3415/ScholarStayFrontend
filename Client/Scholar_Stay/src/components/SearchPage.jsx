import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './SearchPage.css';
import HouseCard from './HouseCard'; // We will create this component next

const SearchPage = () => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();

  useEffect(() => {
    const fetchHouses = async () => {
      setLoading(true);
      setError('');
      try {
        // Construct the query string directly from the location search part
        const queryString = location.search;
        
        // The backend endpoint. Make sure the port matches your backend server.
        const API_URL = `http://localhost:9192/api/v1/houses/filter/list${queryString}`;

        const response = await fetch(API_URL);

        if (!response.ok) {
          // Try to get a more descriptive error from the backend response
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.detail || `Failed to fetch: ${response.statusText}`);
        }

        const data = await response.json();
        setHouses(data);
        
      } catch (err) {
        console.error("Error fetching houses:", err);
        setError(err.message || 'Could not load listings. Please make sure the backend server is running and accessible.');
      } finally {
        setLoading(false);
      }
    };

    fetchHouses();
  }, [location.search]); // Re-run the effect if the URL search string changes

  if (loading) {
    return <div className="status-message">Loading listings...</div>;
  }

  if (error) {
    return (
        <div className="status-message error-message">
            Could not load listings. <br />
            Error: {error} <br />
            Please make sure the backend server is running on port 9192.
        </div>
    );
  }

  return (
    <div className="search-page-container">
      <h2>Search Results</h2>
      {houses.length > 0 ? (
        <div className="house-listings-grid">
          {houses.map(house => (
            <HouseCard key={house.id} house={house} />
          ))}
        </div>
      ) : (
        <div className="status-message">No listings found matching your criteria.</div>
      )}
    </div>
  );
};

export default SearchPage;
