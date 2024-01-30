import { useParams } from 'react-router-dom';
import './DogInfo.css';
import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DogInfo = () => {
  const { id } = useParams(); 
  const [dogDetails, setDogDetails] = useState(null);
  const fetchedDataRefs = useRef([]);
  const [buttonTopPosition, setButtonTopPosition] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();


  const handleAdoptMeClick = () => {
    navigate(`/adopt/${id}`, { state: { dogDetails } }); 
  };

  useEffect(() => {
    const fetchDogDetails = async () => {
      try {
        const response = await fetch(`https://paws4home-2502a21fe873.herokuapp.com/get-dog-listing/${id}`); 
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setDogDetails(data);
      } catch (error) {
        console.error('Error fetching dog details:', error);
      }
    };

    fetchDogDetails();
  }, [id]);

  useEffect(() => {
    if (dogDetails && dogDetails.images && dogDetails.images.length > 0) {
      setSelectedImage(dogDetails.images[0]);
    }
  }, [dogDetails]);

  if (!dogDetails) {
    return <div>Loading...</div>; 
  }

  return (
    <div className="login-container">
      <div className="beige-rectangle">
      <div className="dog-infos-container">
      <div className="fetched-dog-name">{dogDetails.name}</div>
      <div className="info-container">
        <div className="label-container">
          <div className="fetched-label">Breed:</div>
          <div className="fetched-label">Age:</div>
          <div className="fetched-label">Color:</div>
          <div className="fetched-label">Gender:</div>
          <div className="fetched-label">Size:</div>
          <div className="fetched-label">Date Posted:</div>
          <div className="fetched-label bio">Bio:</div>
        </div>
        <div className="data-container">
          <div className="fetched-data">{dogDetails.breed}</div>
          <div className="fetched-data">{dogDetails.age} {dogDetails.age_unit}</div>
          <div className="fetched-data">{dogDetails.color}</div>
          <div className="fetched-data">{dogDetails.gender}</div>
          <div className="fetched-data">{dogDetails.size}</div>
          <div className="fetched-data">{dogDetails.date_added}</div>
          <div className="fetched-data bio">{dogDetails.bio}</div>
        </div>
      </div>
      <div className="application-button" onClick={handleAdoptMeClick}>
        <span className="application-button-text">Adopt Me!</span>
      </div>
      </div>
      <div className="image-thumbnail-container">
      <div className="fetched-dog-image-container">
      <img 
        src={selectedImage} 
        alt="Dog" 
        style={{width: '100%', height: '100%'}} 
      />
    </div>

    <div className="thumbnails-container" style={{ marginTop: '30px' }}>
      {dogDetails.images.map((image, index) => (
        <div key={index} className="thumbnail" onClick={() => setSelectedImage(image)}>
          <img src={image} alt={`Thumbnail ${index}`} style={{ width: '98px', height: '116px' }} />
        </div>
      ))}
    </div>
    </div>
      </div>
    </div>
  );
};

export default DogInfo;