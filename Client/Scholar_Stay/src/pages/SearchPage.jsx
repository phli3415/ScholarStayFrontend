import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../components/SearchPage.css';
import HouseCard from '../components/HouseCard';
import SearchBar from '../components/SearchBar'; // Import the new SearchBar component

const SearchPage = () => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();

  useEffect(() => {
    // This effect will re-run whenever the URL query string changes (i.e., when a new search is performed)
    const fetchHouses = async () => {
      setLoading(true);
      setError('');
      try {
        const queryString = location.search;
        const API_URL = `http://127.0.0.1:8000/api/v1/houses/filter/list${queryString}`;

        const response = await fetch(API_URL);

        if (!response.ok) {
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
  }, [location.search]);

  // Helper function to render the main content based on state
  const renderContent = () => {
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

    if (houses.length > 0) {
      return (
        <div className="house-listings-grid">
          {houses.map(house => (
            <HouseCard key={house.id} house={house} />
          ))}
        </div>
      );
    }

    return <div className="status-message">No listings found matching your criteria.</div>;
  };

  return (
    <div className="search-page-container">
      {/* Add the main title and the reusable SearchBar */}
      <h1 className="main-title">Find Your Next Stay</h1>
      <SearchBar />
      
      {/* Render the appropriate content (loading, error, or results) */}
      {renderContent()}
    </div>
  );
};

export default SearchPage;
