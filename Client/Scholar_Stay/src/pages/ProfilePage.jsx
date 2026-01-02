import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css'; // Make sure the new CSS is imported

// Simple icons - you can replace these with an icon library like react-icons
const BookmarkIcon = () => <span>&#x1F516;</span>; // Bookmark emoji
const AddIcon = () => <span>&#x2795;</span>; // Plus emoji
const LogoutIcon = () => <span>&#x21AA;</span>; // Arrow emoji

const ProfilePage = () => {
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect to login page if user is not authenticated
  useEffect(() => {
    // We add a check for loading state from the context if it exists
    // For now, we rely on session being populated.
    if (!session || !session.user) {
      navigate('/login');
    }
  }, [session, navigate]);

  const handleLogout = async () => {
    const { success } = await logout();
    if (success) {
      navigate('/login'); // Redirect to login after successful logout
    }
    // If logout fails, an error will be set in the context, which you can display if needed
  };

  // While session is loading or if user is not logged in, render nothing.
  // The useEffect will handle the redirect.
  if (!session || !session.user || !session.firebaseUser) {
    return null;
  }

  const userInitial = session.user.username ? session.user.username.charAt(0).toUpperCase() : '?';

  return (
    <div className="profile-page-background">
      <div className="profile-menu-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-picture">
            {userInitial}
          </div>
          <div className="profile-info">
            <p className="username">{session.user.username}</p>
            <p className="email">{session.firebaseUser.email}</p>
          </div>
        </div>

        <hr className="divider" />

        {/* Profile Actions */}
        <ul className="profile-menu-actions">
          <li onClick={() => navigate('/bookmarks')}>
            <span className="icon"><BookmarkIcon /></span>
            View Bookmarks
          </li>
          <li onClick={() => navigate('/add-house')}>
            <span className="icon"><AddIcon /></span>
            Add New House
          </li>
          <li onClick={handleLogout}>
            <span className="icon"><LogoutIcon /></span>
            Log Out
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ProfilePage;
