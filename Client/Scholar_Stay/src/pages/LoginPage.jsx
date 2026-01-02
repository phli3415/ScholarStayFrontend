
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import './LoginPage.css'; // Assuming you have a CSS file for styling

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Get the global error state from the auth context
  const { login, session, error: authError, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for registration success message on component mount
  useEffect(() => {
    if (location.state?.fromRegistration) {
      setSuccessMessage('Registration successful! Please log in.');
      // Clear the state so the message doesn't reappear on navigation
      window.history.replaceState({}, document.title)
    }
  }, [location]);

  // Redirect if user is already logged in
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
      setLocalError('Please enter both email and password.');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await login(email, password);
      
      if (result.success) {
        navigate('/'); // Redirect on successful login
      } else {
        // Handle specific Firebase auth errors for better user feedback
        if (result.error) {
          if (result.error.includes('auth/wrong-password') || result.error.includes('auth/invalid-credential')) {
            setLocalError('Incorrect password or email. Please try again.');
          } else if (result.error.includes('auth/user-not-found')) {
            setLocalError('No account found with this email. Please sign up.');
          } else if (result.error.includes('auth/invalid-email')) {
            setLocalError('The email address is not valid.');
          } else if (result.error.includes('Please verify your email before logging in.')) {
            setLocalError('Please verify your email before logging in.');
          }
          else {
            setLocalError('Failed to log in. Please check your credentials.');
          }
        } else {
            setLocalError('An unexpected error occurred.');
        }
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

        {successMessage && <div className="success-message">{successMessage}</div>}

        <form onSubmit={handleSubmit} noValidate>
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
                placeholder="Enter your password"
              />
            </div>
            
            {(localError || authError) && (
              <p className="error-message">{localError || authError}</p>
            )}
  
            <button type="submit" className="login-button" disabled={isSubmitting || loading}>
              {isSubmitting || loading ? 'Logging In...' : 'Log In'}
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
