import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../components/SearchPage.css';
import HouseCard from '../components/HouseCard';

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
        const queryString = location.search;
        // Updated API_URL to point to your running backend at port 8000
        const API_URL = `http://127.0.0.1:8000/api/v1/houses/filter/list${queryString}`;

        const response = await fetch(API_URL);

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.detail || `Failed to fetch: ${response.statusText}`);
        }

        const data = await response.json();
        // Assuming the backend returns an array of houses directly
        setHouses(data);
        
      } catch (err) {
        console.error("Error fetching houses:", err);
        setError(err.message || 'Could not load listings. Please make sure the backend server is running and accessible.');
      } finally {
        setLoading(false);
      }
    };

    fetchHouses();
  }, [location.search]);

  if (loading) {
    return <div className="status-message">Loading listings...</div>;
  }

  if (error) {
    return (
        <div className="status-message error-message">
            Could not load listings. <br />
            Error: {error} <br />
            Please make sure your backend server is running on port 8000.
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
