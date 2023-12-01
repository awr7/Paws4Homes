// Header.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import logo from '../../assets/img/pawIcon.png';

const Header = ({ isLoggedIn, onLogin, onLogout, isBusinessAccount , handleLogout  }) => {

  const navigate = useNavigate();
  
  const [showDropdown, setShowDropdown] = useState(false);

  const handleMouseEnter = () => {
    console.log("Mouse entered 'My Account'");
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    console.log("Mouse left 'My Account'");
    setShowDropdown(false);
  };

  const handleNavClick = (path) => {
    navigate(path);
  };

  return (
    <header>
      <div className="header-container">
        <div className="gradient-background"></div>
        <div className="nav-links">
        <Link to="/explore" className="nav-item login-link">Explore dogs</Link>
          <div className="nav-item">Match me with a dog</div>
          

          {isLoggedIn ? (
        <div 
          className="nav-item login-link"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          My Account
          {showDropdown && (
            <div className="dropdown-menu">
              {isBusinessAccount ? (
                <>
                  {/* Items for business account */}
                  <div className="dropdown-item" onClick={() => handleNavClick('/my-account')}>My Account</div>
                  <div className="dropdown-item" onClick={() => handleNavClick('/manage-listings')}>Manage Listings</div>
                  <div className="dropdown-item" onClick={() => handleNavClick('/inbox')}>Inbox</div>
                  <div className="dropdown-item" onClick={handleLogout}>Log out</div>
                </>
              ) : (
                <>
                  {/* Items for customer account */}
                  <div className="dropdown-item" onClick={() => handleNavClick('/my-account')}>My Account</div>
                  <div className="dropdown-item" onClick={() => handleNavClick('/inbox')}>Inbox</div>
                  <div className="dropdown-item">Settings</div>
                  <div className="dropdown-item" onClick={handleLogout}>Log out</div>
                </>
              )}
            </div>
          )}
        </div>
          ) : (
            <Link to="/login" className="nav-item login-link">Login</Link>
          )}
        </div>

        <Link to="/" className="brand-link">
          <div className="brand-name">Paws4Homes</div>
          <img className="brand-logo" src={logo} alt="Brand Logo" />
        </Link>
      </div>
    </header>
  );
};

export default Header;
