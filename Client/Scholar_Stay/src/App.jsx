
import { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext'; // Import the AuthProvider
import Navbar from './components/Navbar';
import DisclaimerModal from './components/DisclaimerModal';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import PropertyPage from './pages/PropertyPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';
import AddHousePage from './pages/AddHousePage';
import BookmarkPage from './pages/BookmarkPage';
import { API_BASE_URL } from './config';
import './App.css';

function App() {
  // Fire-and-forget: nudges the (often cold, serverless) database awake as
  // soon as the site loads, before the user navigates to a data-heavy page.
  // Guarded with a ref because StrictMode double-invokes effects in dev —
  // without it this would fire twice locally (harmless, but wasteful).
  const hasWokenBackend = useRef(false);
  useEffect(() => {
    if (hasWokenBackend.current) return;
    hasWokenBackend.current = true;
    console.log('[wake-up] pinging backend to warm up the database…');
    fetch(`${API_BASE_URL}/houses/filter/count`)
      .then((res) => {
        console.log(`[wake-up] backend responded (status ${res.status}) — database should be warm now`);
      })
      .catch((err) => {
        console.log('[wake-up] ping failed (backend may be unreachable):', err.message);
      });
  }, []);

  return (
    <AuthProvider> {/* Wrap the entire app with AuthProvider */}
      <DisclaimerModal />
      <Router>
        <Navbar />
        <Routes>
          {/* Existing Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/property/:id" element={<PropertyPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/add-house" element={<AddHousePage />} />
          <Route path="/bookmarks" element={<BookmarkPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
