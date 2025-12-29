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
        setError('Please verify your email before logging in.');
        await signOut(auth);
        return null;
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
          body: JSON.stringify({ username: firebaseUser.displayName || firebaseUser.email.split('@')[0] }),
        });

        if (!registerResponse.ok) {
          const errorText = await registerResponse.text();
          console.error("Backend registration failed:", errorText);
          throw new Error('Failed to register user on the local server.');
        }
        localUser = await registerResponse.json();
      } else {
        const errorText = await response.text();
        console.error("Backend user fetch failed:", errorText);
        throw new Error('An error occurred while fetching user profile.');
      }

      setSession({ user: localUser, token, firebaseUser });
      setError(null); // Clear previous errors on success
      return localUser;

    } catch (e) {
      console.error("Error in performBackendHandshake:", e);
      setSession({ user: null, token: null, firebaseUser: null });
      setError(e.message);
      if (auth.currentUser) {
        await signOut(auth); 
      }
      return null;
    }
  };

  // Listen for Firebase auth state changes on initial app load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        await performBackendHandshake(firebaseUser);
      } else {
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

      if (username) {
        await updateProfile(firebaseUser, { displayName: username });
      }

      await sendEmailVerification(firebaseUser);
      await signOut(auth);

      return { 
        success: true, 
        message: 'Registration successful! Please check your email to verify your account.', 
        user: firebaseUser 
      };
    } catch (e) {
      console.error("Error in signup:", e);
      setError(e.message);
      return { success: false, error: e.message };
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      // Step 1: Just sign in with Firebase.
      await signInWithEmailAndPassword(auth, email, password);
      
      // Step 2: The onAuthStateChanged listener will automatically fire and
      // trigger performBackendHandshake. We removed the manual call here to fix the race condition.
      return { success: true };

    } catch (e) {
      console.error("Error in login:", e);
      setError(e.message);
      setLoading(false); // Make sure to stop loading on a login failure
      return { success: false, error: e.message };
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
      return { success: true };
    } catch (e) {
      console.error("Error in logout:", e);
      setError(e.message);
      return { success: false, error: e.message };
    }
  };

  const resendVerificationForUser = async (user) => {
    setError(null);
    if (user) {
      try {
        await sendEmailVerification(user);
        return { success: true, message: 'A new verification email has been sent.' };
      } catch (e) {
        console.error("Error in resendVerificationForUser:", e);
        setError(e.message);
        return { success: false, error: 'Failed to send verification email. Please try again later.' };
      }
    }
    const err = 'No user object provided to resend verification email.';
    console.error(err);
    setError(err);
    return { success: false, error: err };
  };

  const value = {
    session,
    loading,
    error,
    login,
    signup,
    logout,
    resendVerificationForUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
