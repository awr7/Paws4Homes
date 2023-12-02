import React from 'react';
import './ManageListings.css';
import { useNavigate  } from 'react-router-dom';

const ManageListingsPage = () => {
  const navigate = useNavigate();

  const navigateToPostDog = () => {
    navigate('/manage-listings/post');
  };
  return (
    <div className="manage-container">
      <div className="white-rectangle">
        <button onClick={navigateToPostDog}>Post a Dog</button>
        </div>
      </div>
  );
};

export default ManageListingsPage;