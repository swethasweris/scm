import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ViewGroups = () => {
  const [groups, setGroups] = useState([]);
  const [message, setMessage] = useState('');
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editFormData, setEditFormData] = useState({
    groupName: '',
    mentorName: '',
    members: []
  });

  const handleEditClick = (group) => {
    setEditingGroup(group._id);
    setEditFormData({
      groupName: group.groupName,
      mentorName: group.mentor || '',
      members: group.members.map(m => m.studentId)
    });
  };

  const handleEditSubmit = async (groupId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`http://localhost:5000/update-group/${groupId}`, editFormData, {
        headers: { Authorization: token }
      });
      setMessage('Group updated successfully');
      setEditingGroup(null);  // Close the modal after successful update
      fetchGroups(); // Re-fetch the groups to reflect the updated data
    } catch (error) {
      setMessage('Error updating group');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      const token = localStorage.getItem('token');
      try {
        await axios.delete(`http://localhost:5000/delete-group/${groupId}`, {
          headers: { Authorization: token }
        });
        setMessage('Group deleted successfully');
        fetchGroups(); // Refresh the groups after deletion
      } catch (error) {
        setMessage('Error deleting group');
      }
    }
  };

  const fetchGroups = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://localhost:5000/view-groups', {
        headers: { Authorization: token },
      });
      setGroups(response.data);
    } catch (error) {
      setMessage('Error fetching groups');
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleMemberClick = async (memberId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`http://localhost:5000/view-contacts?archived=false`, {
        headers: { Authorization: token },
      });
      const memberDetails = response.data.find(member => member._id === memberId);
      if (memberDetails) {
        setSelectedMember(memberDetails);
      } else {
        setMessage('Member not found');
      }
    } catch (error) {
      setMessage('Error fetching member details');
    }
  };

  return (
    <div className="container py-5 bg-light min-vh-100" style={{
      backgroundImage: 'url(/images/bg.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="text-center mb-4">
            <i className="fas fa-users fa-3x text-primary mb-3"></i>
            <h2>Study Teams</h2>
          </div>

          <div className="row g-4">
            {groups.map((group) => (
              <div key={group._id} className="col-md-6">
                <div className="card border-0 shadow-sm h-100">
                  <div
                    className="card-header bg-white border-bottom d-flex justify-content-between align-items-center"
                    onClick={() => setExpandedGroup(expandedGroup === group._id ? null : group._id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <p className="text-muted mb-3">
                      <i className="fas fa-chalkboard-teacher me-2"></i>
                      {group.groupName}
                    </p>
                    <i className={`fas fa-chevron-${expandedGroup === group._id ? 'up' : 'down'}`}></i>
                  </div>
                  <div className="card-body">
                    {expandedGroup === group._id && (
                      <div className="list-group mb-3">
                        {group.members.map((member) => (
                          <button
                            key={member.studentId}
                            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                            onClick={() => handleMemberClick(member.studentId)}
                          >
                            <span>
                              <i className="fas fa-user me-2"></i>
                              {member.name}
                            </span>
                            <i className="fas fa-info-circle text-muted"></i>
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="d-flex justify-content-end">
                      <button
                        className="btn btn-outline-primary btn-sm me-2"
                        onClick={() => handleEditClick(group)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDeleteGroup(group._id)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedMember && (
            <div className="alert alert-info mt-4">
              <h5>Member Details</h5>
              <p><strong>Name:</strong> {selectedMember.name}</p>
              <p><strong>Department:</strong> {selectedMember.department}</p>
            </div>
          )}

          {/* Modal for Editing Group */}
          {editingGroup && (
            <div className="modal show d-block" tabIndex="-1">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header border-0">
                    <h5 className="modal-title text-primary">
                      <i className="fas fa-edit me-2"></i>Edit Team
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setEditingGroup(null)} // Close modal when clicked
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="form-floating mb-3">
                      <input
                        type="text"
                        className="form-control"
                        id="editGroupName"
                        value={editFormData.groupName}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, groupName: e.target.value })
                        }
                      />
                      <label htmlFor="editGroupName">Team Name</label>
                    </div>
                    <div className="form-floating mb-3">
                      <input
                        type="text"
                        className="form-control"
                        id="editMentorName"
                        value={editFormData.mentorName}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, mentorName: e.target.value })
                        }
                      />
                      <label htmlFor="editMentorName">Mentor Name</label>
                    </div>
                    <div className="d-grid gap-2">
                      <button
                        className="btn btn-primary"
                        onClick={() => handleEditSubmit(editingGroup)}
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-backdrop show" onClick={() => setEditingGroup(null)}></div>
            </div>
          )}

          {message && (
            <div className="alert alert-info mt-4">
              <i className="fas fa-info-circle me-2"></i>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewGroups;
