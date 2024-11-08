import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ViewContacts = () => {
    const navigate = useNavigate();
    const [contacts, setContacts] = useState([]);
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [editContactId, setEditContactId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        name: "",
        rollNo: "",
        phoneNo: "",
        department: "",
        cgpa: "",
        email: "",
    });
    const [showArchived, setShowArchived] = useState(false);
    const [classReps, setClassReps] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);

    const fetchContacts = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem("token");
        try {
            const response = await axios.get(
                `http://localhost:5000/view-contacts?archived=${showArchived}`,
                {
                    headers: { Authorization: token },
                }
            );
            setContacts(response.data);
            setFilteredContacts(response.data);
        } catch (error) {
            setMessage(
                "Error fetching contacts: " +
                    (error.response
                        ? error.response.data.message
                        : error.message)
            );
        } finally {
            setLoading(false);
        }
    }, [showArchived]);

    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    const handleSearchChange = (e) => {
        const { value } = e.target;
        setSearchTerm(value);
        const filtered = contacts.filter(
            (contact) =>
                contact.name.toLowerCase().includes(value.toLowerCase()) ||
                contact.rollNo.includes(value) ||
                contact.phoneNo.includes(value) ||
                contact.department
                    .toLowerCase()
                    .includes(value.toLowerCase()) ||
                contact.email.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredContacts(filtered);
    };

    const handleArchiveAction = async (id, currentArchiveStatus) => {
        const actionText = currentArchiveStatus ? "unarchive" : "archive";
        if (
            window.confirm(
                `Are you sure you want to ${actionText} this contact?`
            )
        ) {
            const token = localStorage.getItem("token");
            try {
                await axios.put(
                    `http://localhost:5000/archive-contact/${id}`,
                    { isArchived: !currentArchiveStatus },
                    { headers: { Authorization: token } }
                );
                setMessage(`Contact ${actionText}d`);
                setSelectedContact(null);
                fetchContacts();
            } catch (error) {
                setMessage(
                    `Error ${actionText}ing contact: ` +
                        (error.response
                            ? error.response.data.message
                            : error.message)
                );
            }
        }
    };

    const handleEditClick = (contact) => {
        setEditContactId(contact._id);
        setEditFormData({
            name: contact.name,
            rollNo: contact.rollNo,
            phoneNo: contact.phoneNo,
            department: contact.department,
            cgpa: contact.cgpa,
            email: contact.email,
        });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleEditSubmit = async (id) => {
        const token = localStorage.getItem("token");
        try {
            await axios.put(
                `http://localhost:5000/edit-contact/${id}`,
                editFormData,
                {
                    headers: { Authorization: token },
                }
            );

            // Close edit form
            setEditContactId(null);

            // Refresh contacts list
            await fetchContacts();

            // Refresh modal data
            const updatedContact = await axios.get(
                `http://localhost:5000/view-contact/${id}`,
                {
                    headers: { Authorization: token },
                }
            );
            setSelectedContact(updatedContact.data);

            setMessage("Contact updated successfully");
        } catch (error) {
            setMessage(
                "Error updating contact: " +
                    (error.response
                        ? error.response.data.message
                        : error.message)
            );
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this contact?")) {
            const token = localStorage.getItem("token");
            try {
                await axios.delete(
                    `http://localhost:5000/delete-contact/${id}`,
                    {
                        headers: { Authorization: token },
                    }
                );
                setMessage("Contact deleted");
                setSelectedContact(null);
                fetchContacts();
            } catch (error) {
                setMessage(
                    "Error deleting contact: " +
                        (error.response
                            ? error.response.data.message
                            : error.message)
                );
            }
        }
    };

    const rankContacts = (contacts) => {
        return contacts
            .map((contact) => ({ ...contact, rank: 0 }))
            .sort((a, b) => b.cgpa - a.cgpa)
            .map((contact, index) => ({ ...contact, rank: index + 1 }));
    };

    const handleCreateGroup = () => {
        navigate("/create-group");
    };

    const handleContactClick = (contact) => {
        setSelectedContact(contact);
    };

    const closeModal = () => {
        setSelectedContact(null);
        setEditContactId(null);
    };

    const handleMarkClassRep = async (contact) => {
        const token = localStorage.getItem("token");
        const updatedReps = classReps.includes(contact._id)
            ? classReps.filter((id) => id !== contact._id)
            : [...classReps, contact._id].slice(0, 2);

        setClassReps(updatedReps);
        try {
            await axios.put(
                `http://localhost:5000/mark-class-rep/${contact._id}`,
                { isClassRep: updatedReps.includes(contact._id) },
                {
                    headers: { Authorization: token },
                }
            );
            fetchContacts();
        } catch (error) {
            setMessage(
                "Error marking class representative: " +
                    (error.response
                        ? error.response.data.message
                        : error.message)
            );
        }
    };

    return (
        <div className="container-fluid py-5 bg-light min-vh-100"style={{
            backgroundImage: 'url(/images/bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}>
            <div className="row justify-content-center">
                <div className="col-12 col-lg-10">
                    <div className="text-center mb-4">
                        <i className="fas fa-address-book fa-3x text-primary mb-3"></i>
                        <h2>
                            {showArchived
                                ? "Archived Contacts"
                                : "Active Contacts"}
                        </h2>
                    </div>

                    <div className="d-flex justify-content-between mb-4">
                        <button
                            className="btn btn-outline-primary"
                            onClick={() => setShowArchived(!showArchived)}
                        >
                            <i
                                className={`fas ${
                                    showArchived ? "fa-user" : "fa-archive"
                                } me-2`}
                            ></i>
                            {showArchived
                                ? "Show Active Contacts"
                                : "Show Archived Contacts"}
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleCreateGroup}
                        >
                            <i className="fas fa-users me-2"></i>
                            Create Group
                        </button>
                    </div>

                    <div className="mb-4">
                        <div className="input-group">
                            <span className="input-group-text">
                                <i className="fas fa-search"></i>
                            </span>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search contacts..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center">
                            <div
                                className="spinner-border text-primary"
                                role="status"
                            >
                                <span className="visually-hidden">
                                    Loading...
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {filteredContacts.length > 0 ? (
                                rankContacts(filteredContacts).map(
                                    (contact) => (
                                        <div
                                            key={contact._id}
                                            className="col-auto mb-3"
                                        >
                                            <div
                                                className="card shadow-sm cursor-pointer"
                                                onClick={() =>
                                                    handleContactClick(contact)
                                                }
                                                style={{
                                                    cursor: "pointer",
                                                    minWidth: "250px",
                                                }}
                                            >
                                                <div className="card-body">
                                                    <h5 className="card-title text-primary mb-2">
                                                        {contact.name}
                                                    </h5>
                                                    <div className="small text-muted mb-1">
                                                        <i className="fas fa-phone me-2"></i>
                                                        {contact.phoneNo}
                                                    </div>
                                                    <div className="small text-muted">
                                                        <i className="fas fa-envelope me-2"></i>
                                                        {contact.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )
                            ) : (
                                <div className="text-center">
                                    <p className="text-muted">
                                        No contacts found.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {selectedContact && (
                        <div className="modal show d-block" tabIndex="-1">
                            <div className="modal-dialog modal-dialog-centered modal-lg">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">
                                            Contact Details
                                        </h5>
                                        <button
                                            type="button"
                                            className="btn-close"
                                            onClick={closeModal}
                                        ></button>
                                    </div>
                                    <div className="modal-body">
                                        {editContactId ===
                                        selectedContact._id ? (
                                            <div className="edit-form">
                                                <div className="form-floating mb-3">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="editName"
                                                        name="name"
                                                        value={
                                                            editFormData.name
                                                        }
                                                        onChange={
                                                            handleEditChange
                                                        }
                                                        placeholder="Name"
                                                    />
                                                    <label htmlFor="editName">
                                                        <i className="fas fa-user me-2"></i>
                                                        Name
                                                    </label>
                                                </div>
                                                <div className="form-floating mb-3">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="editRollNo"
                                                        name="rollNo"
                                                        value={
                                                            editFormData.rollNo
                                                        }
                                                        onChange={
                                                            handleEditChange
                                                        }
                                                        placeholder="Roll No"
                                                    />
                                                    <label htmlFor="editRollNo">
                                                        <i className="fas fa-id-card me-2"></i>
                                                        Roll No
                                                    </label>
                                                </div>
                                                <div className="form-floating mb-3">
                                                    <input
                                                        type="tel"
                                                        className="form-control"
                                                        id="editPhoneNo"
                                                        name="phoneNo"
                                                        value={
                                                            editFormData.phoneNo
                                                        }
                                                        onChange={
                                                            handleEditChange
                                                        }
                                                        placeholder="Phone No"
                                                    />
                                                    <label htmlFor="editPhoneNo">
                                                        <i className="fas fa-phone me-2"></i>
                                                        Phone No
                                                    </label>
                                                </div>
                                                <div className="form-floating mb-3">
                                                    <input
                                                        type="email"
                                                        className="form-control"
                                                        id="editEmail"
                                                        name="email"
                                                        value={
                                                            editFormData.email
                                                        }
                                                        onChange={
                                                            handleEditChange
                                                        }
                                                        placeholder="Email"
                                                    />
                                                    <label htmlFor="editEmail">
                                                        <i className="fas fa-envelope me-2"></i>
                                                        Email
                                                    </label>
                                                </div>
                                                <div className="form-floating mb-3">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="editDepartment"
                                                        name="department"
                                                        value={
                                                            editFormData.department
                                                        }
                                                        onChange={
                                                            handleEditChange
                                                        }
                                                        placeholder="Department"
                                                    />
                                                    <label htmlFor="editDepartment">
                                                        <i className="fas fa-building me-2"></i>
                                                        Department
                                                    </label>
                                                </div>
                                                <div className="form-floating mb-3">
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        id="editCgpa"
                                                        name="cgpa"
                                                        value={
                                                            editFormData.cgpa
                                                        }
                                                        onChange={
                                                            handleEditChange
                                                        }
                                                        placeholder="CGPA"
                                                        step="0.01"
                                                        min="0"
                                                        max="10"
                                                    />
                                                    <label htmlFor="editCgpa">
                                                        <i className="fas fa-star me-2"></i>
                                                        CGPA
                                                    </label>
                                                </div>
                                                <div className="d-grid gap-2">
                                                    <button
                                                        className="btn btn-success"
                                                        onClick={() =>
                                                            handleEditSubmit(
                                                                selectedContact._id
                                                            )
                                                        }
                                                    >
                                                        <i className="fas fa-save me-2"></i>
                                                        Save Changes
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-secondary"
                                                        onClick={closeModal}
                                                    >
                                                        <i className="fas fa-times me-2"></i>
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <h5 className="text-primary">
                                                    {selectedContact.name}
                                                </h5>
                                                <p>
                                                    <strong>Roll No:</strong>{" "}
                                                    {selectedContact.rollNo}
                                                </p>
                                                <p>
                                                    <strong>Phone No:</strong>{" "}
                                                    {selectedContact.phoneNo}
                                                </p>
                                                <p>
                                                    <strong>Email:</strong>{" "}
                                                    {selectedContact.email}
                                                </p>
                                                <p>
                                                    <strong>Department:</strong>{" "}
                                                    {selectedContact.department}
                                                </p>
                                                <p>
                                                    <strong>CGPA:</strong>{" "}
                                                    {selectedContact.cgpa}
                                                </p>
                                                <p><strong>Year of Study:</strong> {selectedContact.yearOfStudy}</p>
                                                <div className="d-flex">
                                                    <button
                                                        className="btn btn-outline-warning me-2"
                                                        onClick={() =>
                                                            handleEditClick(
                                                                selectedContact
                                                            )
                                                        }
                                                    >
                                                        <i className="fas fa-edit me-2"></i>
                                                        Edit
                                                    </button>
                                                    <button
                                                        className={`btn btn-outline-${
                                                            selectedContact.isArchived
                                                                ? "success"
                                                                : "warning"
                                                        }`}
                                                        onClick={() =>
                                                            handleArchiveAction(
                                                                selectedContact._id,
                                                                selectedContact.isArchived
                                                            )
                                                        }
                                                    >
                                                        <i
                                                            className={`fas fa-${
                                                                selectedContact.isArchived
                                                                    ? "box-open"
                                                                    : "archive"
                                                            } me-2`}
                                                        ></i>
                                                        {selectedContact.isArchived
                                                            ? "Unarchive"
                                                            : "Archive"}
                                                    </button>

                                                    <button
                                                        className="btn btn-danger"
                                                        onClick={() =>
                                                            handleDelete(
                                                                selectedContact._id
                                                            )
                                                        }
                                                    >
                                                        <i className="fas fa-trash me-2"></i>
                                                        Delete
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewContacts;
