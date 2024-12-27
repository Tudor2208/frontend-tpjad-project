import { useState } from 'react';  
import { useNavigate } from 'react-router-dom';
import '../css/SignUpForm.css';
import { toast } from 'sonner';

function SignupForm(props) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    const userData = {
      email,
      password,
      firstName,
      lastName
    };

    try {
      const response = await fetch('http://localhost:8080/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        toast.success("Registration successful!");
        navigate("/login"); 
      } else {
        const data = await response.json();
        toast.error(data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred while registering. Please try again.");
    }
  };

  return (
    <div id="container-signup">
      <div id="container-title-signup">
        <h1>Sign Up</h1>
      </div>

      <div id="container-form-signup">
        <form onSubmit={handleSubmit}>
          <div className="row-signup">
            <i className="fa-solid fa-envelope"></i>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail"
            />
          </div>

          <div className="row-signup">
            <i className="fa-solid fa-user"></i>
            <input
              required
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
            />
          </div>

          <div className="row-signup">
            <i className="fa-solid fa-user"></i>
            <input
              required
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
            />
          </div>

          <div className="row-signup">
            <i className="fa-solid fa-lock"></i>
            <input
              required
              type='password' 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Password"
              id="password-signup"
            />
          </div>

          <div className="row-signup">
            <i className="fa-solid fa-lock"></i>
            <input
              required
              type='password' 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} 
              placeholder="Confirm Password"
              id="confirm-password-signup"
            />
          </div>

          <input type="submit" value="Sign Up" id="submit-button-signup" />
        </form>
      </div>
    </div>
  );
}

export default SignupForm;
