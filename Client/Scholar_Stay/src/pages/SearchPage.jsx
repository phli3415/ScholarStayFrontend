import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../components/SearchPage.css';
import HouseCard from '../components/HouseCard';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 30;

const SearchPage = () => {
  const [houses, setHouses] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // Page number is derived from the URL search params.
  const queryParams = new URLSearchParams(location.search);
  const currentPage = parseInt(queryParams.get('page') || '1', 10);

  useEffect(() => {
    const fetchHouses = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams(location.search);
        // We ensure limit and offset are set for every request based on the current page.
        params.set('limit', String(PAGE_SIZE));
        params.set('offset', String((currentPage - 1) * PAGE_SIZE));
        
        const API_URL = `http://127.0.0.1:8000/api/v1/houses/filter/list?${params.toString()}`;

        const response = await fetch(API_URL);

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.detail || `Failed to fetch: ${response.statusText}`);
        }

        const data = await response.json();
        setHouses(data.houses || []); // Ensure houses is always an array
        setTotalCount(data.total_count || 0); // Get total count from response
        
      } catch (err) {
        console.error("Error fetching houses:", err);
        setError(err.message || 'Could not load listings. Please make sure the backend server is running and accessible.');
      } finally {
        setLoading(false);
      }
    };

    fetchHouses();
    // The effect re-runs whenever the search part of the URL changes.
  }, [location.search]);

  const handlePageChange = (page) => {
    const params = new URLSearchParams(location.search);
    params.set('page', String(page));
    navigate({ search: params.toString() });
  };

  const renderContent = () => {
    if (loading) {
      return <div className="status-message">Loading listings...</div>;
    }

    if (error) {
      return (
          <div className="status-message error-message">
              Could not load listings. <br />
              Error: {error} <br />
              Please make sure your backend server is running on port 8000 and returns data in the format: `{{'total_count': number, 'houses': [...]}}`
          </div>
      );
    }

    if (houses.length > 0) {
      return (
        <>
          <div className="house-listings-grid">
            {houses.map(house => (
              <HouseCard key={house.id} house={house} />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalCount={totalCount}
            pageSize={PAGE_SIZE}
            onPageChange={handlePageChange}
          />
        </>
      );
    }

    return <div className="status-message">No listings found matching your criteria.</div>;
  };

  return (
    <div className="search-page-container">
      <h1 className="main-title">Find Your Next Stay</h1>
      <SearchBar />
      {renderContent()}
    </div>
  );
};

export default SearchPage;
