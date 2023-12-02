import React, { useRef, useState, useEffect  } from 'react';
import './postDog.css';
import InputPair from './InputPair';
import DogCard from '../Explore/DogCard';
import kobe from '../../assets/img/kobePup.jpg';

const PostDog = () => {
    const fileInputRefs = useRef([]);
    const [dogImages, setDogImages] = useState(new Array(5).fill(null));
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [dogName, setDogName] = useState('');
    const [dogAge, setDogAge] = useState('');
    const [dogUnit, setDogUnit] = useState(''); 
    const [dogBreed, setDogBreed] = useState('');
    const [showTooltip, setShowTooltip] = useState(false);

    const handleImageClick = (index) => {
        setCurrentImageIndex(index);
        if (fileInputRefs.current[index]) {
          fileInputRefs.current[index].click();
        }
      };
    
      const handleImageChange = (index) => (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function (e) {
            const newImages = [...dogImages];
            newImages[index] = e.target.result;
            setDogImages(newImages);
          };
          reader.readAsDataURL(file);
        }
      };
    
      const handlePreviewClick = (index) => {
        if (dogImages[index]) {
          setCurrentImageIndex(index);
        } else {
          handleImageClick(index);
        }
      };

      const handleMouseEnter = () => {
        setShowTooltip(true);
        console.log(showTooltip);
      }; 
    
      const handleMouseLeave = () => {
        setShowTooltip(false);
      };

  return (
    <div className="manage-container">
      <div className="beige-rectangle">
      <div className="heading-text">
          List Your Dog for Adoption Here!
            </div>
            <div className="form-style">
          <div className="input-group">
          <InputPair label="Name" id="name" placeholder="Name" value={dogName} onChange={(e) => setDogName(e.target.value)} />
          <InputPair label="Breed" id="breed" placeholder="Breed" value={dogBreed} onChange={(e) => setDogBreed(e.target.value)} />
          </div>
          <div className="input-group">
            <div className="input-group age-unit-group">
            <InputPair label="Age" id="age" placeholder="Age" value={dogAge} onChange={(e) => setDogAge(e.target.value)} />
            <InputPair label="Unit" id="age-unit" inputType="dropdown" options={[{ value: 'months', label: 'Months' }, { value: 'years', label: 'Years' }]} value={dogUnit} onChange={(e) => setDogUnit(e.target.value)} />
          </div>
            <InputPair label="Color" id="color" placeholder="Color" />
          </div>
          
          <div className="input-group">
            <InputPair label="Gender" id="gender" inputType="dropdown" options={[{ value: 'female', label: 'Female' }, { value: 'male', label: 'Male' }]} />
            <InputPair label="Size" id="size" inputType="dropdown" options={[{ value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }]} />
          </div>
          <div className="input-group">
            <InputPair label="Bio" id="bio" placeholder="Add some fun facts about the dog!" isTextArea={true} />
          </div>
          </div>
          <div className="submit-button">
          Submit Your Listing
        </div>
        <div className="card-preview-text">Card Preview</div>
        <div
          className="dog-card-container"
          onMouseEnter={handleMouseEnter} // Hover event for Dog Card container
          onMouseLeave={handleMouseLeave} // Hover event for Dog Card container
          onClick={() => handleImageClick(currentImageIndex)}
        >
          <DogCard
            image={dogImages[currentImageIndex] || kobe}
            name={dogName}
            age={`${dogAge} ${dogUnit}`}
            breed={dogBreed}
            dimImage={showTooltip} // Dim the image when tooltip is shown
          />
        </div>
        <div className="additional-images-container">
        {dogImages.map((image, index) => (
            <div
            key={index}
            className={`image-upload-square ${index === 0 ? 'profile-picture' : ''}`}
            onClick={() => handlePreviewClick(index)}
          >
            {image ? (
              <img src={image} alt={`Uploaded Image ${index + 1}`} />
            ) : (
              <div>{index === 0 ? 'Main Photo' : 'Upload Picture'}</div>
            )}
            {index === 0 && <div className="main-picture-text">Main Photo</div>}
            <input
              type="file"
              ref={(el) => (fileInputRefs.current[index] = el)}
              onChange={handleImageChange(index)}
              style={{ display: 'none' }}
              accept="image/*"
            />
          </div>
          ))}
        </div>
      </div>
    </div>
  );
};


export default PostDog;