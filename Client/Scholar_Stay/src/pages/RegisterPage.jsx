import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.css'; // We can reuse the same CSS for a consistent look

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signup, session } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in, redirect them
  useEffect(() => {
    if (session && session.user) {
      navigate('/');
    }
  }, [session, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLocalError('');
    setIsSubmitting(true);

    if (!email || !password || !username) {
      setLocalError('Please fill in all fields.');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await signup(email, password, username);
      if (result.success) {
        setMessage(result.message);
        // Clear form on success
        setEmail('');
        setPassword('');
        setUsername('');
      } else {
        setLocalError(result.error || 'Failed to create an account. Please try again.');
      }
    } catch (err) {
      setLocalError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page-container"> {/* Reusing login page styles */}
      <div className="login-form-card">   {/* Reusing login page styles */}
        <h2>Create Your Account</h2>
        <p>Find your new home, faster.</p>
        
        {/* Success Message Display */}
        {message && <p className="success-message">{message}</p>}

        {/* Form only shows if no success message is present */}
        {!message && (
          <form onSubmit={handleSubmit} noValidate>
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="e.g., john_doe"
              />
            </div>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="yourname@example.com"
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Choose a strong password"
              />
            </div>
            
            {localError && <p className="error-message">{localError}</p>}

            <button type="submit" className="login-button" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
        )}

        <div className="signup-link">
          <p>
            Already have an account? <Link to="/login">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
