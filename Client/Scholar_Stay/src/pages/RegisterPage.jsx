import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.css'; // Reusing the same CSS

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  
  const [message, setMessage] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [localError, setLocalError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

  const { signup, resendVerificationForUser, session } = useAuth();
  const navigate = useNavigate();

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

    if (!email || !password || !username || !confirmPassword) {
      setLocalError('Please fill in all fields.');
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
        setLocalError('Passwords do not match.');
        setIsSubmitting(false);
        return;
    }

    try {
      const result = await signup(email, password, username);
      if (result.success) {
        setMessage(result.message);
        setRegisteredUser(result.user);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setUsername('');
      } else {
        if (result.error && result.error.includes('auth/email-already-in-use')) {
            setLocalError('This email address is already registered. Please try logging in.');
        } else {
            setLocalError(result.error || 'Failed to create an account. Please try again.');
        }
      }
    } catch (err) {
      setLocalError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendEmail = async () => {
    if (!registeredUser) {
        setResendMessage('Could not find user information to resend email.');
        return;
    }
    setIsResending(true);
    setResendMessage('');
    try {
        const result = await resendVerificationForUser(registeredUser);
        if(result.success) {
            setResendMessage(result.message);
        } else {
            setResendMessage(result.error || 'An error occurred.');
        }
    } catch(err) {
        setResendMessage(err.message || 'An unexpected error occurred.');
    } finally {
        setIsResending(false);
    }
  }

  return (
    <div className="login-page-container"> 
      <div className="login-form-card">
        <h2>Create Your Account</h2>
        <p>Find your new home, faster.</p>
        
        {message && !localError && (
            <div className="success-message">
                <p>{message}</p>
                <p>If you don\'t see it, please check your spam folder.</p>
                <div style={{ marginTop: '1.5rem' }}>
                    <button 
                        onClick={handleResendEmail} 
                        disabled={isResending}
                        className="login-button" 
                        style={{ backgroundColor: '#555', fontSize: '0.9rem'}}
                    >
                        {isResending ? 'Sending...' : 'Resend Verification Email'}
                    </button>
                    {resendMessage && <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>{resendMessage}</p>}
                </div>
            </div>
        )}

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
             <div className="input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter your password"
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
