import './App.css';
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header/Header';
import Home from './components/Home/Home';
import Login from './components/Login/Login';
import Signup from './components/Signup/Signup';
import ShelterBreederSignup from './components/Signup/ShelterBreederSignup';
import CustomerSignup from './components/Signup/CustomerSignup';
import MyAccount from './components/Dashboard/MyAccount'
import Inbox  from './components/Dashboard/Inbox'
import ManageListings from './components/Dashboard/ManageListings'
import ExplorePage from './components/Explore/ExplorePage';



const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isBusinessAccount, setIsBusinessAccount] = useState(false);

  useEffect(() => {
    console.log('isLoggedIn state changed:', isLoggedIn);
  }, [isLoggedIn]);

  useEffect(() => {
  const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const businessAccount = JSON.parse(localStorage.getItem('isBusinessAccount') || 'false');
  setIsLoggedIn(loggedIn);
  setIsBusinessAccount(businessAccount);
  }, []);

  // Function to update login status
  const handleLogin = (isBusiness = false) => {
    setIsLoggedIn(true);
    setIsBusinessAccount(isBusiness);
    localStorage.setItem('isLoggedIn', 'true'); // Save login state to local storage
    localStorage.setItem('isBusinessAccount', JSON.stringify(isBusiness));  
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsBusinessAccount(false);
    localStorage.removeItem('isLoggedIn'); // Remove login state from local storage
    localStorage.removeItem('isBusinessAccount');
  };

  return (
    <Router>
       <Header 
        isLoggedIn={isLoggedIn} 
        handleLogout={handleLogout} 
        isBusinessAccount={isBusinessAccount} 
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login handleLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signup/customer" element={<CustomerSignup />} />
        <Route path="/signup/shelter-breeder" element={<ShelterBreederSignup />} />
        <Route path="/my-account" element={<MyAccount />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/manage-listings" element={<ManageListings />} />
        <Route path="/explore" element={<ExplorePage />} />
      </Routes>
    </Router>
  );
};

export default App;
