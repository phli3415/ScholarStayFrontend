import React from 'react';
import './Hero.css';
import SearchBar from './SearchBar'; // Import the new SearchBar component

const Hero = () => {
  return (
    <div className="hero-container">
      <div className="hero-content">
        <h1>Find Your Next Stay</h1>
        <p>Find your perfect UMass home base with AI-powered matching. Experience seamless student living with local hosts and smart technology tailored to you.</p>
        {/* Replace the old search bar with the new reusable component */}
        <SearchBar />
      </div>
    </div>
  );
};

export default Hero;
