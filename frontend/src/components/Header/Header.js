// Header.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import logo from '../../assets/img/pawIcon.png';

const Header = ({ isLoggedIn, isBusinessAccount , handleLogout  }) => {

  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleMouseEnter = () => {
    console.log("Mouse entered 'My Account'");
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    setShowDropdown(false);
  };

  const handleNavClick = (path) => {
    navigate(path);
  };

  const toggleHamburgerMenu = (e) => {
    setIsHamburgerOpen(e.target.checked);
  };  

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (isLoggedIn) {
        try {
          // Log the credentials being sent
          console.log("Sending credentials: 'include'");
  
          const response = await fetch('https://paws4home-2502a21fe873.herokuapp.com/get_unread_message_count/', {
            method: 'GET',
            credentials: 'include',
          });
  
          // Log the response object
          console.log("Response from get_unread_message_count:", response);
  
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
  
          const data = await response.json();
          // Log the data received
          console.log("Data received:", data); // This will show the unread count and any other data received
  
          setUnreadCount(data.unread_count);
        } catch (error) {
          console.error('Error fetching unread message count:', error);
        }
      }
    };
  
    fetchUnreadCount();
  }, [isLoggedIn]);
  
  
  

  return (
    <header>
      <div className="header-container">
        <div className="gradient-background"></div>
        <nav role="navigation">
          <div id="menuToggle">
            <input type="checkbox" checked={isHamburgerOpen} onChange={toggleHamburgerMenu} />
            <span></span>
            <span></span>
            <span></span>
            <ul id="menu">
              <Link to="/explore" style={{ textDecoration: 'none'}}><li>Explore Dogs</li></Link>
              <Link to="/match-with-a-dog" style={{ textDecoration: 'none'}}><li>Match me with a dog</li></Link>
              {isLoggedIn && (
                <>
                  <Link to="/my-account" style={{ textDecoration: 'none'}}><li>My Account </li></Link>
                  {isBusinessAccount ? (
                    <>
                      <Link to="/manage-listings" style={{ textDecoration: 'none'}}><li>Manage Listings</li></Link>
                    </>
                  ) : null}
                  <Link to="/inbox" style={{ textDecoration: 'none'}}><li>Inbox {unreadCount > 0 && `(${unreadCount})`}</li></Link>
                  <li onClick={handleLogout}>Log out</li>
                </>
              )}
              {!isLoggedIn && <Link to="/login"><li>Login</li></Link>}
            </ul>
          </div>
        </nav>
        <div className="nav-links" style={{ display: isHamburgerOpen ? 'none' : 'flex' }}>
        <Link to="/explore" className="nav-item login-link">Explore dogs</Link>
        <Link to="/match-with-a-dog" className="nav-item login-link">Match me with a dog</Link>
          
          

          {isLoggedIn ? (
        <div 
          className="nav-item login-link"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          My Account{unreadCount > 0 && <span className="unread-count">({unreadCount})</span>}
          {showDropdown && (
            <div className="dropdown-menu">
              {isBusinessAccount ? (
                <>
                  {/* Items for business account */}
                  <div className="dropdown-item" onClick={() => handleNavClick('/my-account')}>My Account</div>
                  <div className="dropdown-item" onClick={() => handleNavClick('/manage-listings')}>Manage Listings</div>
                  <div className="dropdown-item" onClick={() => handleNavClick('/inbox')}>Inbox{unreadCount > 0 && <span className="unread-count-dropdown">({unreadCount})</span>} </div>
                  <div className="dropdown-item" onClick={handleLogout}>Log out</div>
                </>
              ) : (
                <>
                  {/* Items for customer account */}
                  <div className="dropdown-item" onClick={() => handleNavClick('/my-account')}>My Account</div>
                  <div className="dropdown-item" onClick={() => handleNavClick('/inbox')}>  Inbox{unreadCount > 0 && <span className="unread-count-dropdown">({unreadCount})</span>}</div>
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
