import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiLogOut, FiGrid, FiMenu, FiX } from 'react-icons/fi';
import { RiLeafLine } from 'react-icons/ri';
import WaveButton from '../ui/WaveButton';
import useAuthStore from '../../store/authStore';

/**
 * Navbar – Sticky, glassmorphism navbar.
 * Left: Logo + App Name
 * Right: Login (unauthenticated) / Profile dropdown (authenticated)
 */
export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleLogout() {
    logout();
    setDropdownOpen(false);
    navigate('/');
  }

  const dashboardPath = user?.role === 'officer' ? '/officer-dashboard' : '/dashboard';

  return (
    <nav className="nav-wrapper glass">
      <div className="nav-container">
        <div className="nav-inner">
          {/* Logo */}
          <Link to="/" className="nav-logo">
            <div className="nav-logo-icon">
              <RiLeafLine />
            </div>
            <span className="nav-logo-text">
              Clean<span className="nav-logo-highlight">City</span> Connect
            </span>
          </Link>

          {/* Desktop Right Side */}
          <div className="nav-desktop-menu">
            <Link to="/complaint-map" className="nav-link">
              Map View
            </Link>
            <Link to="/feedback" className="nav-link">
              Feedback
            </Link>

            {isAuthenticated ? (
              <div className="nav-profile-container" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="nav-profile-btn"
                >
                  <div className="nav-profile-avatar">
                    <FiUser />
                  </div>
                  <span className="nav-profile-name">
                    {user?.name || 'User'}
                  </span>
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div className="nav-dropdown">
                    <Link
                      to={dashboardPath}
                      onClick={() => setDropdownOpen(false)}
                      className="nav-dropdown-item"
                    >
                      <FiGrid className="nav-dropdown-icon" />
                      Dashboard
                    </Link>
                    <hr className="nav-dropdown-divider" />
                    <button
                      onClick={handleLogout}
                      className="nav-dropdown-item nav-dropdown-item--danger"
                    >
                      <FiLogOut className="nav-dropdown-icon" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <WaveButton size="sm" onClick={() => navigate('/login')}>
                Login
              </WaveButton>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="nav-mobile-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="nav-mobile-menu">
            <Link
              to="/complaint-map"
              onClick={() => setMobileMenuOpen(false)}
              className="nav-mobile-link"
            >
              Map View
            </Link>
            <Link
              to="/feedback"
              onClick={() => setMobileMenuOpen(false)}
              className="nav-mobile-link"
            >
              Feedback
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to={dashboardPath}
                  onClick={() => setMobileMenuOpen(false)}
                  className="nav-mobile-link"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="nav-mobile-link nav-mobile-link--danger"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="nav-mobile-link nav-mobile-link--primary"
              >
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
