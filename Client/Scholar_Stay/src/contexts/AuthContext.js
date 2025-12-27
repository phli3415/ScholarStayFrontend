import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../firebase'; // Assuming firebase is configured in '../firebase'

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState({
    user: null,         // User profile from your local backend
    token: null,        // Firebase ID Token
    firebaseUser: null, // Raw Firebase user object
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // This function performs the "handshake" with your backend
  const performBackendHandshake = async (firebaseUser) => {
    try {
      if (!firebaseUser.emailVerified) {
        throw new Error('Please verify your email before logging in.');
      }

      const token = await firebaseUser.getIdToken();
      
      const response = await fetch(`${API_BASE_URL}/user/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      let localUser;

      if (response.ok) { // Status 200-299
        localUser = await response.json();
      } else if (response.status === 404) {
        // User is authenticated with Firebase but not in our local DB -> register them
        const registerResponse = await fetch(`${API_BASE_URL}/user/register`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          // Use a default username from the email, or the display name
          body: JSON.stringify({ username: firebaseUser.displayName || firebaseUser.email.split('@')[0] }),
        });

        if (!registerResponse.ok) {
          throw new Error('Failed to register user on the local server.');
        }
        localUser = await registerResponse.json();
      } else {
        // Other server errors
        throw new Error('An error occurred while fetching user profile.');
      }

      setSession({ user: localUser, token, firebaseUser });
      return localUser;

    } catch (e) {
      // If any part of the handshake fails, the user session is not valid
      setSession({ user: null, token: null, firebaseUser: null });
      setError(e.message);
      // It's often useful to also sign the user out of Firebase if the backend handshake fails
      await signOut(auth); 
      return null;
    }
  };

  // Listen for Firebase auth state changes on initial app load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in to Firebase, now check our backend
        await performBackendHandshake(firebaseUser);
      } else {
        // User is signed out
        setSession({ user: null, token: null, firebaseUser: null });
      }
      setLoading(false);
    });

    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  const signup = async (email, password, username) => {
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update Firebase profile display name
      if (username) {
        await updateProfile(firebaseUser, { displayName: username });
      }

      // Send verification email
      await sendEmailVerification(firebaseUser);
      
      // We don't log the user in. We ask them to verify their email first.
      await signOut(auth);

      return { success: true, message: 'Registration successful! Please check your email to verify your account.' };
    } catch (e) {
      setError(e.message);
      return { success: false, error: e.message };
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // The onAuthStateChanged listener will automatically handle the backend handshake
      // but we can also trigger it manually for immediate feedback
      const localUser = await performBackendHandshake(userCredential.user);
      if (localUser) {
         return { success: true, user: localUser };
      }
      // If handshake fails, the error is already set inside it
      return { success: false, error: error };

    } catch (e) {
      setError(e.message);
      return { success: false, error: e.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
      // The onAuthStateChanged listener will clear the session
      return { success: true };
    } catch (e) {
      setError(e.message);
      return { success: false, error: e.message };
    }
  };

  const resendVerificationEmail = async () => {
     setError(null);
     // We check the raw firebase user from the session state
     if (session.firebaseUser) {
        try {
            await sendEmailVerification(session.firebaseUser);
            return { success: true, message: 'Verification email sent!' };
        } catch (e) {
            setError(e.message);
            return { success: false, error: e.message };
        }
     }
     setError('No user is currently logged in to resend verification email.');
     return { success: false, error: 'No user logged in.' };
  };

  const value = {
    session,
    loading,
    error,
    login,
    signup,
    logout,
    resendVerificationEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
