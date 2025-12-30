import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, session, error: authError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session && session.user) {
      navigate('/');
    }
  }, [session, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setIsSubmitting(true);

    if (!email || !password) {
      setLocalError('Please fill in both email and password.');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/'); 
      } else {
        let errorMessage = 'Failed to log in. Please try again.';
        if (result.error) {
            switch (result.error) {
                case 'auth/user-not-found':
                case 'auth/invalid-email':
                    errorMessage = 'No account found with this email. Please sign up or try again.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password. Please try again.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Cannot connect to the network. Please check your internet connection.';
                    break;
                default:
                    errorMessage = result.error; 
                    break;
            }
        }
        setLocalError(errorMessage);
      }
    } catch (err) {
      setLocalError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-form-card">
        <h2>Welcome Back</h2>
        <p>Log in to continue your housing search.</p>
        <form onSubmit={handleSubmit} noValidate>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="e.g., yourname@example.com"
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
              placeholder="Enter your password"
            />
          </div>
          
          {(localError || authError) && (
            <p className="error-message">{localError || authError}</p>
          )}

          <button type="submit" className="login-button" disabled={isSubmitting}>
            {isSubmitting ? 'Logging In...' : 'Log In'}
          </button>
        </form>
        <div className="signup-link">
          <p>
            Don't have an account? <Link to="/register">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
