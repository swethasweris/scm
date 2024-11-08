import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const StudentLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/studentlogin', { username, password });
      localStorage.setItem('studentToken', response.data.token); // Store token for session management
      setMessage('Login successful! Redirecting...');
      setTimeout(() => {
        navigate('/studentdashboard'); // Redirect to student dashboard or main page after login
      }, 2000);
    } catch (error) {
      setMessage('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light" style={{
      backgroundImage: 'url(/images/bg.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <div className="card shadow-lg" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <i className="fas fa-sign-in-alt fa-3x text-primary mb-3"></i>
            <h2 className="card-title">Student Login</h2>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="username"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <label htmlFor="username"><i className="fas fa-user me-2"></i>Username</label>
            </div>
            <div className="form-floating mb-4">
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label htmlFor="password"><i className="fas fa-lock me-2"></i>Password</label>
            </div>
            <button className="btn btn-primary w-100 mb-3 py-2">
              <i className="fas fa-sign-in-alt me-2"></i>Login
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary w-100 py-2"
              onClick={() => navigate('/studentregister')}
            >
              <i className="fas fa-user-plus me-2"></i>Go to Register
            </button>
          </form>
          {message && <div className="alert alert-info mt-3">{message}</div>}
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
