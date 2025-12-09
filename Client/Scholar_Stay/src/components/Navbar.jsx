import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // We will create this file next

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">ScholarStay</Link>
      </div>
      <ul className="navbar-links">
        <li><Link to="/search">Search</Link></li>
        <li><Link to="/chat">AI Assistant</Link></li>
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/register">Register</Link></li>
        <li><Link to="/profile">Profile</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
