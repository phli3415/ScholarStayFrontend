import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import the useAuth hook
import './Navbar.css';

const Navbar = () => {
  const { session } = useAuth(); // Get session state

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">ScholarStay</Link>
      </div>
      <ul className="navbar-links">
        <li><Link to="/search">Search</Link></li>
        <li><Link to="/chat">AI Assistant</Link></li>

        {session && session.user ? (
          // If user is logged in, show the Profile and Add House links
          <>
            <li><Link to="/add-house">Add House</Link></li>
            <li><Link to="/profile">Profile</Link></li>
          </>
        ) : (
          // If user is not logged in, show Login and Register links
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
