import React, { useState } from 'react';
import './DisclaimerModal.css';

// Plain component state (not persisted) is enough here: App only mounts once
// per full page load/refresh — client-side route changes don't remount it —
// so this naturally shows once per visit without needing localStorage.
const DisclaimerModal = () => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="disclaimer-overlay" role="dialog" aria-modal="true" aria-label="Demo disclaimer">
      <div className="disclaimer-box">
        <h2>Just a heads up</h2>
        <p>
          ScholarStay is a personal student project developed to demonstrate
          an agentic AI workflow, not a functioning housing service. The
          listings shown are for demonstration purposes only and should not
          be considered accurate, current, or genuine.
        </p>
        <p>
          Listing data comes from a public dataset on Kaggle:{' '}
          <a
            href="https://www.kaggle.com/datasets/adithyaawati/apartments-for-rent-classified"
            target="_blank"
            rel="noopener noreferrer"
          >
            Apartments for Rent Classified
          </a>
          .
        </p>
        <p className="disclaimer-links">
          Source code:{' '}
          <a
            href="https://github.com/phli3415/ScholarStayBackend"
            target="_blank"
            rel="noopener noreferrer"
          >
            Backend
          </a>
          {' '}&middot;{' '}
          <a
            href="https://github.com/phli3415/ScholarStayFrontend"
            target="_blank"
            rel="noopener noreferrer"
          >
            Frontend
          </a>
        </p>
        <button type="button" className="disclaimer-close" onClick={() => setVisible(false)}>
          Got it
        </button>
      </div>
    </div>
  );
};

export default DisclaimerModal;
