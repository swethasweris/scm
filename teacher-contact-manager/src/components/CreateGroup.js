import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateGroup = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [mentorName, setMentorName] = useState('');
  const [mentorEmail, setMentorEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const fetchContacts = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://localhost:5000/view-contacts', {
        headers: { Authorization: token },
      });
      setContacts(response.data);
    } catch (error) {
      setMessage('Error fetching contacts');
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleContactSelection = (contactId) => {
    setSelectedContacts((prevSelected) =>
      prevSelected.includes(contactId)
        ? prevSelected.filter((id) => id !== contactId)
        : [...prevSelected, contactId]
    );
  };

  const handleCreateGroup = async () => {
    const token = localStorage.getItem('token');
    const groupData = {
      groupName: groupName,
      mentorName: mentorName,
      mentorEmail: mentorEmail,
      members: selectedContacts,
    };

    try {
      await axios.post('http://localhost:5000/create-group', groupData, {
        headers: { Authorization: token },
      });
      setMessage('Group created successfully!');
      navigate('/view-groups');
    } catch (error) {
      setMessage('Error creating group');
    }
  };

  return (
    <div className="container-fluid py-5 bg-light min-vh-100" style={{
      backgroundImage:'url(/images/bg.jpg)', 
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card shadow-lg">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <i className="fas fa-users-rectangle fa-3x text-primary mb-3"></i>
                <h2>Create Study Team</h2>
              </div>

              <div className="form-floating mb-4">
                <input
                  type="text"
                  className="form-control"
                  id="groupName"
                  placeholder="Team Name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
                <label htmlFor="groupName">
                  <i className="fas fa-layer-group me-2"></i>Team Name
                </label>
              </div>

              <div className="form-floating mb-4">
                <input
                  type="text"
                  className="form-control"
                  id="mentorName"
                  placeholder="Mentor Name"
                  value={mentorName}
                  onChange={(e) => setMentorName(e.target.value)}
                />
                <label htmlFor="mentorName">
                  <i className="fas fa-user-tie me-2"></i>Mentor Name
                </label>
              </div>

              <div className="form-floating mb-4">
                <input
                  type="email"
                  className="form-control"
                  id="mentorEmail"
                  placeholder="Mentor Email"
                  value={mentorEmail}
                  onChange={(e) => setMentorEmail(e.target.value)}
                />
                <label htmlFor="mentorEmail">
                  <i className="fas fa-envelope me-2"></i>Mentor Email
                </label>
              </div>

              <div className="card mb-4">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                    <i className="fas fa-user-plus me-2"></i>Select Members
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    {contacts.map((contact) => (
                      <div key={contact._id} className="col-md-6 col-lg-4">
                        <div className={`card ${selectedContacts.includes(contact._id) ? 'border-primary' : ''}`}>
                          <div className="card-body">
                            <div className="form-check d-flex align-items-center">
                              <input
                                type="checkbox"
                                className="form-check-input me-3"
                                id={`contact-${contact._id}`}
                                checked={selectedContacts.includes(contact._id)}
                                onChange={() => handleContactSelection(contact._id)}
                              />
                              <label 
                                className="form-check-label w-100" 
                                htmlFor={`contact-${contact._id}`}
                                style={{ cursor: 'pointer' }}
                              >
                                <div className="d-flex flex-column">
                                  <span className="fw-bold text-primary">{contact.name}</span>
                                  <small className="text-muted">
                                    <i className="fas fa-graduation-cap me-1"></i>
                                    {contact.department}
                                  </small>
                                </div>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="d-grid gap-2">
                <button 
                  className="btn btn-primary py-2"
                  onClick={handleCreateGroup}
                  disabled={!groupName || !mentorName || !mentorEmail || selectedContacts.length === 0}
                >
                  <i className="fas fa-plus-circle me-2"></i>Create Team
                </button>
                <button 
                  className="btn btn-outline-secondary py-2"
                  onClick={() => navigate('/view-groups')}
                >
                  <i className="fas fa-arrow-left me-2"></i>Back to Teams
                </button>
              </div>

              {message && (
                <div className="alert alert-info mt-3">
                  <i className="fas fa-info-circle me-2"></i>
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGroup;
