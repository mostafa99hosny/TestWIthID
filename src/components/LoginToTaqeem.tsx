import { useState } from 'react';
import './LoginToTaqeem.css';


const LoginToTaqeem = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate successful login, then show OTP modal
    setIsModalOpen(false);
    setShowOtpModal(true);
    // You can add your login logic here
    console.log('Login attempt with:', { email, password });
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add your OTP verification logic here
    console.log('OTP submitted:', otp);
    setShowOtpModal(false);
    setEmail('');
    setPassword('');
    setOtp('');
  };

  return (
    <div className="loginContainer">
      <button className="loginButton" onClick={() => setIsModalOpen(true)}>
        Login
      </button>

      {isModalOpen && (
        <div className="modalOverlay">
          <div className="modalContent">
            <button className="closeButton" onClick={() => setIsModalOpen(false)}>
              ×
            </button>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <div className="formGroup">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="formGroup">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="submitButton">
                Login
              </button>
            </form>
          </div>
        </div>
      )}

      {showOtpModal && (
        <div className="modalOverlay">
          <div className="modalContent">
            <button className="closeButton" onClick={() => setShowOtpModal(false)}>
              ×
            </button>
            <h2>Enter OTP</h2>
            <form onSubmit={handleOtpSubmit}>
              <div className="formGroup">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={6}
                />
              </div>
              <button type="submit" className="submitButton">
                Submit OTP
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginToTaqeem;
