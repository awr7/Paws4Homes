import paw from '../../assets/img/PawIconColor.png';
import DisplayPair from '../Applications/DisplayPair';
import InputPair  from '../Dashboard/InputPair'
import './MyAccount.css'
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef  } from 'react';

const MyAccountPage = () => {
  const loggedInUserId = localStorage.getItem('userId');
  const [userData, setUserData] = useState({});
  const [userProfilePic, setUserProfilePic] = useState('');
  const navigate = useNavigate();
  const [isBusinessAccount, setIsBusinessAccount] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [reNewPassword, setReNewPassword] = useState('');
  const fileInputRef = useRef();
  const [profilePicture, setProfilePicture] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const token = localStorage.getItem('token');

  console.log('token is ' , token);
  

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        console.log('Fetching user profile...');
        const response = await fetch(`https://paws4home-2502a21fe873.herokuapp.com/user_profile/${loggedInUserId}/`, {
          method: 'GET',
          headers: {
          'Authorization': `Token ${token}`,
          },
        });
  
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
  
        const userData = await response.json();
        console.log('User profile data:', userData); // Log the fetched user data
        setUserData(userData);
        setUserProfilePic(userData.profile_image);
        setCompanyName(userData.company_name || '');
        setFirstName(userData.first_name || '');
        setLastName(userData.last_name || '');
        setPhoneNumber(userData.phone_number || '');
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
  
    if (loggedInUserId) {
      fetchUserProfile();
    }
    const storedValue = localStorage.getItem('isBusinessAccount');
        if (storedValue) {
            setIsBusinessAccount(JSON.parse(storedValue));
        }
  }, [loggedInUserId]);


  const toggleEditMode = () => {
    setIsEditMode(prevMode => !prevMode);
};
const handleSave = async () => {
  const updatedUserData = {
    company_name: companyName,
    first_name: firstName,
    last_name: lastName,
    phone_number: phoneNumber,
  };
  try {
    const url = `https://paws4home-2502a21fe873.herokuapp.com/update_user_profile/${loggedInUserId}/`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(updatedUserData),
    });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error updating user profile:', errorData);
        throw new Error(`Network response was not ok: ${errorData.message}`);
      }

      const result = await response.json();
      console.log('Update successful:', result);
      // Update local state to reflect changes
      setUserData(result);
      setIsEditMode(false); // Exit edit mode after successful update
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  };
  
  const handleChangePassword = async () => {
    if (newPassword !== reNewPassword) {
      alert('Passwords do not match!');
      return;
    }

    // TODO: Add more validations for newPassword if needed

    try {
      const response = await fetch('https://paws4home-2502a21fe873.herokuapp.com/change_password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Handle successful password change
      alert('Password changed successfully. Please log in with your new password.');
      await handleLogout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Error changing password');
    }
  };

  const handleLogout = async () => {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('isBusinessAccount');
      localStorage.removeItem('userId')
  };

  const handleImageClick = () => {
    console.log('click click')
    fileInputRef.current.click();
  };
  
  const handleProfilePicChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Set the selected profile picture file
      setProfilePicture(file);
  
      // Create a FormData object and append the file
      const formData = new FormData();
      formData.append('image', file);
  
      try {
        const response = await fetch('https://paws4home-2502a21fe873.herokuapp.com/upload-profile-picture/', {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Token ${token}`,
            },
        });
  
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
  
        const data = await response.json();
  
        // Update the profile picture URL with the newly uploaded image
        setProfilePictureUrl(data.image_url);
      } catch (error) {
        console.error('Error uploading profile picture:', error);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="white-rectangle">
        <div className="login-rectangle">
          <h2 className="my-account-title">Customize your profile!</h2>
          <div className="my-account-white-circle">
            <img
              src={profilePictureUrl || userProfilePic}
              alt="Profile"
              className="my-account-image"
              onClick={handleImageClick}
            />
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleProfilePicChange}
            />
          </div>
          <button className="change-pic-button" onClick={handleImageClick}>
            <span className="change-pic-text">Choose New Profile Picture</span>
          </button>
          <div className='info-head'>Your email is the only thing that cannot be changed.</div>
          <div className='button-container'>
          <button className="edit-button1" onClick={toggleEditMode}>
          {isEditMode ? "Undo" : "Edit"}
        </button>

        {isEditMode && (
          <button className="save-button1" onClick={handleSave}>
            Save
          </button>
        )}
        </div>
          <div className="my-info-style1">
          <div className="input-group">
            {isEditMode ? (
              isBusinessAccount ? (
                <InputPair
                  label="Company Name"
                  id="companyName"
                  placeholder="Enter company name"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                />
              ) : (
                <>
                  <InputPair
                    label="First Name"
                    id="firstName"
                    placeholder="Enter first name"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                  />
                  <InputPair
                    label="Last Name"
                    id="lastName"
                    placeholder="Enter last name"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                  />
                </>
              )
            ) : (
              isBusinessAccount ? (
                <DisplayPair label="Company Name" value={userData.company_name} customValueClass="my-info-display-value" />
              ) : (
                <>
                  <DisplayPair label="First Name" value={userData.first_name} customValueClass="my-info-display-value" />
                  <DisplayPair label="Last Name" value={userData.last_name} customValueClass="my-info-display-value" />
                </>
              )
            )}
          </div>

          <div className="input-group">
            <DisplayPair label="Email" value={userData.email} customValueClass="my-info-display-value" />

            {!isEditMode && (
              <DisplayPair label="Phone Number" value={userData.phone_number} customValueClass="my-info-display-value" />
            )}

            {isEditMode && (
              <InputPair
                label="Phone Number"
                id="phoneNumber"
                placeholder="Enter phone number"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
              />
            )}
          </div>

          <h3 className="change-password">Change your password</h3>
          <div className="input-group">
            <InputPair
              label="Enter Password"
              id="password"
              placeholder="Enter your new password"
              inputType="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <InputPair
              label="Re-enter Password"
              id="rePassword"
              placeholder="Re-enter your new password"
              inputType="password"
              value={reNewPassword}
              onChange={(e) => setReNewPassword(e.target.value)}
            />
          </div>

          <button className="change-pass-button" onClick={handleChangePassword}>Change Password</button>
        </div>
          <img src={paw} alt="Paw Icon" className="paw-icon" />
        </div>
        <h2 className="my-account-info">Change your information</h2>
        <h4>Your email is the only thing that cannot be changed.</h4>
        <button className="edit-button" onClick={toggleEditMode}>
          {isEditMode ? "Undo" : "Edit"}
        </button>

        {isEditMode && (
          <button className="save-button" onClick={handleSave}>
            Save
          </button>
        )}
        <div className="my-info-style">
          <div className="input-group">
            {isEditMode ? (
              isBusinessAccount ? (
                <InputPair
                  label="Company Name"
                  id="companyName"
                  placeholder="Enter company name"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                />
              ) : (
                <>
                  <InputPair
                    label="First Name"
                    id="firstName"
                    placeholder="Enter first name"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                  />
                  <InputPair
                    label="Last Name"
                    id="lastName"
                    placeholder="Enter last name"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                  />
                </>
              )
            ) : (
              isBusinessAccount ? (
                <DisplayPair label="Company Name" value={userData.company_name} customValueClass="my-info-display-value" />
              ) : (
                <>
                  <DisplayPair label="First Name" value={userData.first_name} customValueClass="my-info-display-value" />
                  <DisplayPair label="Last Name" value={userData.last_name} customValueClass="my-info-display-value" />
                </>
              )
            )}
          </div>

          <div className="input-group">
            <DisplayPair label="Email" value={userData.email} customValueClass="my-info-display-value" />

            {!isEditMode && (
              <DisplayPair label="Phone Number" value={userData.phone_number} customValueClass="my-info-display-value" />
            )}

            {isEditMode && (
              <InputPair
                label="Phone Number"
                id="phoneNumber"
                placeholder="Enter phone number"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
              />
            )}
          </div>

          <h3 className="change-password">Change your password</h3>
          <div className="input-group">
            <InputPair
              label="Enter Password"
              id="password"
              placeholder="Enter your new password"
              inputType="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <InputPair
              label="Re-enter Password"
              id="rePassword"
              placeholder="Re-enter your new password"
              inputType="password"
              value={reNewPassword}
              onChange={(e) => setReNewPassword(e.target.value)}
            />
          </div>

          <button className="change-pass-button" onClick={handleChangePassword}>Change Password</button>
        </div>
      </div>
    </div>
  );
};

export default MyAccountPage;