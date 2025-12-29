import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css'; // Import the stylesheet

const ProfilePage = () => {
  const { session, logout, resendVerificationForUser } = useAuth();
  const navigate = useNavigate();
  const [resendMessage, setResendMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  // Redirect to login page if user is not authenticated
  useEffect(() => {
    if (!session || !session.user) {
      navigate('/login');
    }
  }, [session, navigate]);

  const handleLogout = async () => {
    const { success } = await logout();
    if (success) {
      navigate('/login');
    }
  };
  
  const handleResendVerification = async () => {
      if (!session.firebaseUser) return;
      setIsResending(true);
      setResendMessage('');
      const result = await resendVerificationForUser(session.firebaseUser);
      if(result.success) {
        setResendMessage(result.message);
      } else {
        setResendMessage(result.error || 'An error occurred.');
      }
      setIsResending(false);
  }

  // Render a loading state or nothing while session is being checked
  if (!session || !session.user) {
    return null;
  }

  const { user, firebaseUser } = session;

  return (
    <div className="profile-page-container">
      <h1>Your Profile</h1>

      <div className="profile-card">
        <h2>Account Details</h2>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>UID:</strong> {firebaseUser.uid}</p>
        <p><strong>Email Verification:</strong> 
            {firebaseUser.emailVerified ? 
                <span className='verified'>Verified</span> : 
                <span className='not-verified'>Not Verified</span>
            }
            {!firebaseUser.emailVerified && (
                <>
                    <button 
                        className="resend-button" 
                        onClick={handleResendVerification}
                        disabled={isResending}
                    >
                        {isResending ? 'Sending...' : 'Resend Verification Email'}
                    </button>
                </>
            )}
        </p>
        {resendMessage && <p className="resend-message">{resendMessage}</p>}
      </div>

      <div className="profile-card">
          <h2>Quick Actions</h2>
          <div className="quick-actions-buttons">
            <button className="action-button" onClick={() => navigate('/bookmarks')}>View Bookmarks</button>
            <button className="action-button" onClick={() => navigate('/add-listing')}>Add a Listing</button>
            <button className="action-button logout-button" onClick={handleLogout}>Log Out</button>
          </div>
      </div>

    </div>
  );
};

export default ProfilePage;
