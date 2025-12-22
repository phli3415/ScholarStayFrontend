import React from 'react';
import './Pagination.css';

const Pagination = ({ onPageChange, currentPage, totalCount, pageSize }) => {
  const totalPages = Math.ceil(totalCount / pageSize);

  // Don't render pagination if there's only one page or no results
  if (totalPages <= 1) {
    return null;
  }

  // Function to get the range of pages to display
  const getPageRange = () => {
    const range = [];
    // Always show first page
    if (totalPages > 1) range.push(1);

    // Add ellipsis if needed
    if (currentPage > 4) {
      range.push('...');
    }

    // Add pages around the current page
    for (let i = currentPage - 2; i <= currentPage + 2; i++) {
      if (i > 1 && i < totalPages) {
        range.push(i);
      }
    }

    // Add ellipsis if needed
    if (currentPage < totalPages - 3) {
      range.push('...');
    }

    // Always show last page
    if (totalPages > 1) range.push(totalPages);

    // Remove duplicates that might occur with small number of pages
    return [...new Set(range)]; 
  };

  const pageNumbers = getPageRange();

  return (
    <nav className="pagination-container">
      <ul className="pagination-list">
        {/* Previous Page Button (optional, can be added here) */}

        {pageNumbers.map((number, index) => {
          if (number === '...') {
            return <li key={`ellipsis-${index}`} className="pagination-item ellipsis"><span>...</span></li>;
          }

          return (
            <li
              key={number}
              className={`pagination-item ${currentPage === number ? 'active' : ''}`}
              onClick={() => onPageChange(number)}
            >
              <span>{number}</span>
            </li>
          );
        })}

        {/* Next Page Button */}
        {currentPage < totalPages && (
            <li className="pagination-item arrow" onClick={() => onPageChange(currentPage + 1)}>
                <span>&rsaquo;</span>
            </li>
        )}
      </ul>
    </nav>
  );
};

export default Pagination;
