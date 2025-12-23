import React from 'react';
import './Pagination.css'; 
import { usePagination, DOTS } from './usePagination';

const Pagination = (props) => {
  const { onPageChange, totalCount, siblingCount = 1, currentPage, pageSize } = props;

  const paginationRange = usePagination({
    currentPage,
    totalCount,
    siblingCount,
    pageSize,
  });

  // If there are less than 2 times in pagination range we shall not render the component
  if (currentPage === 0 || paginationRange.length < 2) {
    return null;
  }

  const onNext = () => {
    onPageChange(currentPage + 1);
  };

  const onPrevious = () => {
    onPageChange(currentPage - 1);
  };

  let lastPage = paginationRange[paginationRange.length - 1];

  return (
    <div className="pagination-container">
      <ul className="pagination-list">
        {/* Left navigation arrow */}
        <li
          className={`pagination-item arrow ${currentPage === 1 ? 'disabled' : ''}`}
          onClick={currentPage === 1 ? null : onPrevious}
        >
          <span>&#x2190;</span>
        </li>
        
        {paginationRange.map((pageNumber, index) => {
          // If the pageItem is a DOT, render the DOTS unicode character
          if (pageNumber === DOTS) {
            return <li key={`dots-${index}`} className="pagination-item dots">&#8230;</li>;
          }

          // Render our Page Pills
          return (
            <li
              key={pageNumber}
              className={`pagination-item ${pageNumber === currentPage ? 'active' : ''}`}
              onClick={() => onPageChange(pageNumber)}
            >
              <span>{pageNumber}</span>
            </li>
          );
        })}
        
        {/* Right navigation arrow */}
        <li
          className={`pagination-item arrow ${currentPage === lastPage ? 'disabled' : ''}`}
          onClick={currentPage === lastPage ? null : onNext}
        >
          <span>&#x2192;</span>
        </li>
      </ul>
    </div>
  );
};

export default Pagination;
