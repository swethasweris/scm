import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudentDashboard = () => {
  const [username, setUsername] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch username from localStorage or server
    const storedUsername = localStorage.getItem('username'); // Assume username is stored in local storage after login
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleScreenshotUpload = async (e) => {
    e.preventDefault();
    if (!screenshot) {
      setMessage('Please select a screenshot to upload');
      return;
    }
  
    const formData = new FormData();
    formData.append('screenshot', screenshot);
    formData.append('username', username);
  
    try {
      await axios.post('http://localhost:5000/api/studentdashboard', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('Screenshot uploaded successfully!');
    } catch (error) {
      setMessage('Failed to upload screenshot. Please try again.');
    }
  };
  
  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light" style={{
      backgroundImage: 'url(/images/bg.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <div className="card shadow-lg p-4" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="card-body">
          <h2 className="text-center mb-4">Student Dashboard</h2>
          <h5 className="text-center mb-4">
            Welcome, <span className="text-primary">{username}</span>
          </h5>
  
          <form onSubmit={handleScreenshotUpload}>
            <div className="mb-3">
              <label htmlFor="screenshot" className="form-label">Upload Screenshot</label>
              <input
                type="file"
                className="form-control"
                id="screenshot"
                accept="image/*"
                onChange={(e) => setScreenshot(e.target.files[0])}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 mb-3">
              <i className="fas fa-upload me-2"></i>Upload Screenshot
            </button>
          </form>
  
          {message && <div className="alert alert-info mt-3">{message}</div>}
        </div>
      </div>
    </div>
  );
  
};

export default StudentDashboard;
