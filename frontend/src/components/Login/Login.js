// Login.js
import './Login.css';
import paw from '../../assets/img/PawIconColor.png';
import cloud from '../../assets/img/dogCloud.png';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';

const Login = ({handleLogin} ) => {
    const navigate = useNavigate(); 

    const [loginError, setLoginError] = useState('');  // State to store login error

    const handleLoginFormSubmit = async (event) => {
      event.preventDefault();
      
      const formData = new FormData(event.target);
      const payload = Object.fromEntries(formData);
  
      try {
          const response = await fetch('https://paws4home-2502a21fe873.herokuapp.com/login/', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload),
          });
  
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
  
          const data = await response.json();
          
          if (data.token) {
              localStorage.setItem('token', data.token);
              handleLogin(data.userId, data.isBusiness);
              console.log('userID in Login.js: ', data.userId);
              navigate('/');
          } else {
              
              setLoginError('Login successful but no authentication token received.');
          }
      } catch (error) {
          console.error('Login error:', error);
          setLoginError(error.message || 'Network error or server is not responding');
      }
  };

  
  

    const handleSignupClick = () => {
    navigate('/signup'); 
  };

    return (
      <div className="login-container">
        <div className="white-rectangle">
        <img src={cloud} alt="Cloud" className="cloud-icon" />
          <div className="login-rectangle">
            <h2 className="login-title">Login</h2>
            <form className="email-form" onSubmit={handleLoginFormSubmit }>
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="john@gmail.com"
                className="email-input"
              />
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                className="password-input" 
              />
              <button type="submit" className="login-button">
                <span className="login-button-text">Login</span>
              </button>
            </form>
            {loginError && <div className="login-error">{loginError}</div>}
            <div className="or-divider">
              <div className="or-text">OR</div>
            </div>
            <button className="signup-button" onClick={handleSignupClick}>
              <span className="signup-text">Signup Now</span>
            </button>
            <img src={paw} alt="Paw Icon" className="paw-icon" />
          </div>
        </div>
      </div>
    );
};

export default Login;
