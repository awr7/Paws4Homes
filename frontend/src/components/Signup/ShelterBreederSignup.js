import './ShelterBreederSignup.css';
import paw from '../../assets/img/PawIconColor.png';

const ShelterBreederSignup = () => {

    const handleSubmit = (event) => {
        event.preventDefault(); 
    
        const formData = new FormData(event.target);
        let formOutput = ''; 
    
        for (const [key, value] of formData.entries()) {
            formOutput += `${key}: ${value} `;
        }
        console.log("Form submitted!")
        console.log(formOutput.trim()); 
    };
    
    
    return (
        <div className="signup-container">
            <div className="white-rectangle">
                <div className="colored-rectangle">
                    <div className="signup-heading-text">Signup</div>
                    <div className="description-text">
                        Create an account to be one step closer <br/>to share your dogs to the world!
                    </div>
                    <div className="additional-rectangle">
                        <div className="quote-text">
                            “Dogs are not our whole life, but they make our lives whole.” —Roger Caras
                        </div>
                    </div>
                    <img src={paw} alt="Paw Icon" className="paw-pic" />
                </div>
                <div className="form-container">
                    <form onSubmit={handleSubmit} className="signup-form">
                        <div className="form-field">
                            <label htmlFor="companyNameOrFullName" className="name-label">Company Name or Your Full Name</label>
                            <input type="text" id="companyNameOrFullName" name="companyNameOrFullName" className="form-input" placeholder="Humane Animal Shelter Inc." />
                        </div>
                        <div className="form-field-group">
                            <div className="form-field email-field">
                                <label htmlFor="email" className="email-label">Email</label>
                                 <input type="email" id="email" name="email" className="email" placeholder="john@gmail.com" />
                            </div>
                            <div className="form-field phone-field">
                                <label htmlFor="phone" className="phone-label">Phone Number</label>
                                <input type="tel" id="phone" name="phone" className="phone" placeholder="+84 988 888 888" />
                            </div>
                        </div>
                        <div className="form-field-group">
                            <div className="form-field password-field">
                                <label htmlFor="password" className="password-label">Password</label>
                                <input type="password" id="password" name="password" className="password" placeholder="Enter your password" />
                            </div>
                            <div className="form-field password-field">
                                <label htmlFor="rePassword" className="repassword-label">Re-enter Password</label>
                                <input type="password" id="rePassword" name="rePassword" className="repassword" placeholder="Re-enter your password" />
                            </div>
                        </div>
                        <button type="submit" className="create-account-button">
                            <span className="signup-button-text">Create Account</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ShelterBreederSignup;