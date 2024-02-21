import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import DogCard from '../Explore/DogCard';
import kobe from '../../assets/img/kobePup.jpg';

const MatchedPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { matchedBreeds, matchedDogs } = location.state || { matchedBreeds: [], matchedDogs: [] };

    return (
        <div className="login-container">
            <div className='match-rectangle'>
            <div className="matched-container">
                <div className="matched-breeds-section">
                <div className='headingMatch'>We think these breeds are your perfect match:</div>
                    <ul className="breed-list">
                        {matchedBreeds.map((breed, index) => (
                            <li key={index} className="breed-item">{breed}</li>
                        ))}
                    </ul>
                </div>
                <div className="match-dogs-section">
                        <div className='headingMatch'>We got these pups you will love</div>
                        </div>
                        <div className="dogs-list">
                            {matchedDogs.map((dog, index) => (
                                <div className="dog-card-wrapper" key={index}>
                                    <Link to={`/dog/${dog.id}`}>
                                        <DogCard
                                            image={dog.images && dog.images.length > 0 ? dog.images[0] : kobe}
                                            name={dog.name}
                                            age={`${dog.age} ${dog.age_unit}`}
                                            breed={dog.breed}
                                        />
                                    </Link>
                                </div>
                            ))}
                    </div>
                    <button className="see-all-dogs-button" onClick={() => navigate('/explore')}>See All Dogs</button>   
            </div>
            </div>
        </div>
    );
};

export default MatchedPage;
