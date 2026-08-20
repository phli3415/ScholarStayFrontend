import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../components/SearchPage.css'; // Corrected import path
import HouseCard from '../components/HouseCard';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import { API_BASE_URL } from '../config';

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
    // Timing instrumentation to find where search latency actually goes —
    // fetch (network + backend) vs JSON parsing vs the two parallel requests
    // individually, since a slow count query would hide behind a fast list
    // query in the overall Promise.all time.
    const timeFetch = async (label, url) => {
      const start = performance.now();
      const res = await fetch(url);
      const elapsed = (performance.now() - start).toFixed(0);
      console.log(`[search-timing] ${label}: ${elapsed}ms (status ${res.status})`);
      return res;
    };

    const fetchHouses = async () => {
      const overallStart = performance.now();
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

        const API_URL = `${API_BASE_URL}/houses/filter/list?${params.toString()}`;
        const COUNT_API_URL = `${API_BASE_URL}/houses/filter/count?${countParams.toString()}`;

        // Fire both requests in parallel, each individually timed
        const [response, countResponse] = await Promise.all([
          timeFetch('filter/list', API_URL),
          timeFetch('filter/count', COUNT_API_URL),
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

        const jsonStart = performance.now();
        const data = await response.json();
        const countData = await countResponse.json();
        console.log(`[search-timing] JSON parsing: ${(performance.now() - jsonStart).toFixed(0)}ms`);
        console.log(`[search-timing] response payload size: ~${(JSON.stringify(data).length / 1024).toFixed(0)}KB, ${Array.isArray(data) ? data.length : 0} houses`);

        setHouses(data || []); // Ensure houses is always an array
        setTotalCount(countData || 0); // Get total count from the count response

      } catch (err) {
        console.error("Error fetching houses:", err);
        setError(err.message || 'Could not load listings. Please ensure the backend server is running and accessible.');
      } finally {
        setLoading(false);
        console.log(`[search-timing] total (mount to render): ${(performance.now() - overallStart).toFixed(0)}ms`);
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
