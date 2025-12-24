import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../components/SearchPage.css'; // Corrected import path
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

  const queryParams = new URLSearchParams(location.search);
  const currentPage = parseInt(queryParams.get('page') || '1', 10);

  useEffect(() => {
    const fetchHouses = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams(location.search);
        params.set('limit', String(PAGE_SIZE));
        params.set('offset', String((currentPage - 1) * PAGE_SIZE));
        
        // Create a new URLSearchParams for the count API without limit and offset
        const countParams = new URLSearchParams(location.search);
        countParams.delete('limit');
        countParams.delete('offset');
        countParams.delete('page');

        const API_URL = `http://127.0.0.1:8000/api/v1/houses/filter/list?${params.toString()}`;
        const COUNT_API_URL = `http://127.0.0.1:8000/api/v1/houses/filter/count?${countParams.toString()}`;

        // Fire both requests in parallel
        const [response, countResponse] = await Promise.all([
          fetch(API_URL),
          fetch(COUNT_API_URL)
        ]);

        // Handle error from the main listings fetch
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.detail || `Failed to fetch listings: ${response.statusText}`);
        }

        // Handle error from the count fetch
        if (!countResponse.ok) {
          const errorData = await countResponse.json().catch(() => null);
          throw new Error(errorData?.detail || `Failed to fetch count: ${countResponse.statusText}`);
        }

        const data = await response.json();
        const countData = await countResponse.json();
        console.log("Fetched data:", data);
        console.log("Fetched count data:", countData);

        setHouses(data || []); // Ensure houses is always an array
        setTotalCount(countData || 0); // Get total count from the count response
       
      } catch (err) {
        console.error("Error fetching houses:", err);
        setError(err.message || 'Could not load listings. Please ensure the backend server is running and accessible.');
      } finally {
        setLoading(false);
      }
    };

    fetchHouses();
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
              Error: {error}
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
