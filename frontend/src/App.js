import './App.css';
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header/Header';
import Home from './components/Home/Home';
import Login from './components/Login/Login';
import Signup from './components/Signup/Signup';
import ShelterBreederSignup from './components/Signup/ShelterBreederSignup';
import CustomerSignup from './components/Signup/CustomerSignup';



const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Function to update login status
  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <Header isLoggedIn={isLoggedIn} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signup/customer" element={<CustomerSignup />} />
        <Route path="/signup/shelter-breeder" element={<ShelterBreederSignup />} />
      </Routes>
    </Router>
  );
};

export default App;
