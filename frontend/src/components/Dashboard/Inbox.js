import React, { useState, useEffect } from 'react';
import magnifyGlass from '../../assets/img/maginifyingGlass.png';
import './Inbox.css';
import { Link, useNavigate } from 'react-router-dom';


const InboxPage = () => {

  const [messages, setMessages] = useState([]); // State to hold messages
  const loggedInUserId = localStorage.getItem('userId');
  const [userData, setUserData] = useState({});
  const [userProfilePic, setUserProfilePic] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
          const response = await fetch('https://paws4home-2502a21fe873.herokuapp.com/get_messages/', {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`,
              },
          });
  
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
  
          const data = await response.json();
          const currentUserId = loggedInUserId; // Get current user's ID
  
          // Filter messages to only include those where the current user is the receiver
          const messagesToCurrentUser = data.filter(message => message.receiver_id === parseInt(currentUserId, 10));
          setMessages(messagesToCurrentUser); // Update state with filtered messages
      } catch (error) {
          console.error('Error fetching messages:', error);
      }
    };
  
    fetchMessages();
  }, []);

    const latestMessages = messages.reduce((acc, message) => {
      const existingMessage = acc.find(m => m.sender_id === message.sender_id);
      if (!existingMessage || new Date(existingMessage.timestamp) < new Date(message.timestamp)) {
          acc = acc.filter(m => m.sender_id !== message.sender_id); // Remove old message
          acc.push(message); // Add the latest message
      }
      return acc;
  }, []);

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
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
  
    if (loggedInUserId) {
      fetchUserProfile();
    }
  }, [loggedInUserId]);

  const handleEditProfileClick = () => {
    navigate('/my-account');
  };

  return (
    <div className="inbox-container">
      <div className="white-rectangle">
        <div className="inbox-profile-rectangle">
          <div className="inbox-welcome-text">
            Welcome, {userData.is_business_account ? userData.company_name : `${userData.first_name}`}
          </div>
          <div className="white-circle">
            <img src={userProfilePic} alt="Profile" className="circle-image"/>
          </div>
          <div className="email-text">{userData.email}</div>
          <div className="edit-profile-button" onClick={handleEditProfileClick}>
            <div className="edit-profile-text">Edit profile</div>
          </div>
        </div>
        <div className="inbox-rectangle">
        <div className="search-and-actions-container">
          <div className="inbox-search-bar">
            <input type="text" placeholder="Search inbox" />
          </div>
          <img src={magnifyGlass} alt="Magnify Glass" className="inbox-magnifying-glass"/>
  
          <div className="small-new-post-button">
            <div className="small-new-post-text">New Message</div>
          </div>
          </div>
          <div className="labely-rectangle">
            <div className="message-header">
              <div className="header-column">
                <div className="listing-label">From:</div>
              </div>
              <div className="vertical-separator"></div>
              <div className="header-column">
                <div className="listing-label">Last Message:</div>
              </div>
            </div>
          </div>
          <div className="message-list-container">
            {latestMessages.map((message, index) => (
              <React.Fragment key={message.sender_id}>
                <div className="message-row">
                  <div className="message-column">
                    <Link to={`/messages/${message.sender_id}`}>
                      <div className="inbox-data">{message.sender_name}</div>
                    </Link>
                  </div>
                  <div className="message-column">
                    <Link to={`/messages/${message.sender_id}`}>
                      <div className="inbox-data">{message.content}</div>
                    </Link>
                  </div>
                </div>
                {index < latestMessages.length - 1 && <div className="horizontal-line"></div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InboxPage;