import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light" style={{
      backgroundImage: 'url(/images/bg.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <div className="card shadow-lg p-4" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="card-body">
          <h2 className="text-center mb-4">Welcome to the Contact Manager</h2>

          <div className="mb-5">
            <h4 className="text-center">Are you a Student?</h4>
            <div className="d-flex justify-content-around mt-3">
              <button 
                className="btn btn-primary w-45"
                onClick={() => navigate('/studentregister')}
              >
                <i className="fas fa-user-plus me-2"></i>Student Register
              </button>
              <button 
                className="btn btn-secondary w-45"
                onClick={() => navigate('/studentlogin')}
              >
                <i className="fas fa-sign-in-alt me-2"></i>Student Login
              </button>
            </div>
          </div>

          <hr />

          <div className="mt-5">
            <h4 className="text-center">Are you a Teacher?</h4>
            <div className="d-flex justify-content-around mt-3">
              <button 
                className="btn btn-primary w-45"
                onClick={() => navigate('/register')}
              >
                <i className="fas fa-user-plus me-2"></i>Teacher Register
              </button>
              <button 
                className="btn btn-secondary w-45"
                onClick={() => navigate('/login')}
              >
                <i className="fas fa-sign-in-alt me-2"></i>Teacher Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
