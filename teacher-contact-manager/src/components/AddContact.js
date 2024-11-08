import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddContact = () => {
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [department, setDepartment] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [email, setEmail] = useState('');
  const [idCard, setIdCard] = useState(null);
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Web Speech API is not supported in this browser.");
    } else {
      const recognitionInstance = new window.webkitSpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        console.log("Speech recognition started");
      };

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[event.resultIndex][0].transcript.trim().toLowerCase();
        console.log("Transcript: ", transcript);
        handleTranscript(transcript);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        console.log("Speech recognition ended");
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const startListening = () => {
    if (recognition) {
      recognition.start();
      setIsListening(true);
      console.log("Speech recognition started...");
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
      console.log("Speech recognition stopped...");
    }
  };

  const handleTranscript = (transcript) => {
    const commands = [
      { keyword: "name", action: setName },
      { keyword: "roll no", action: setRollNo },
      { keyword: "phone no", action: setPhoneNo },
      { keyword: "year of study", action: setYearOfStudy },
      { keyword: "department", action: setDepartment },
      { keyword: "cgpa", action: setCgpa },
      { keyword: "email", action: setEmail },
    ];

    commands.forEach(({ keyword, action }) => {
      if (transcript.includes(keyword)) {
        const value = transcript.split(`${keyword} is`)[1]?.trim();
        if (value) {
          action(value);
          focusNextEmptyField();
        }
      }
    });
  };

  const focusNextEmptyField = () => {
    const fields = [
      { value: name, id: "rollNo" },
      { value: rollNo, id: "phoneNo" },
      { value: phoneNo, id: "yearOfStudy" },
      { value: yearOfStudy, id: "department" },
      { value: department, id: "cgpa" },
      { value: cgpa, id: "email" },
    ];

    for (const field of fields) {
      if (!field.value) {
        document.getElementById(field.id)?.focus();
        break;
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('rollNo', rollNo);
    formData.append('phoneNo', phoneNo);
    formData.append('yearOfStudy', yearOfStudy);
    formData.append('department', department);
    formData.append('cgpa', cgpa);
    formData.append('email', email);
    formData.append('idCard', idCard);

    try {
      const response = await axios.post('http://localhost:5000/add-contact', formData, {
        headers: {
          Authorization: localStorage.getItem('token'),
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage(response.data.message);

      setName('');
      setRollNo('');
      setPhoneNo('');
      setYearOfStudy('');
      setDepartment('');
      setCgpa('');
      setEmail('');
      setIdCard(null);

      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      setMessage('Error adding contact');
    }
  };

  const navigateToViewContacts = () => {
    navigate('/view-contacts');
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="card shadow-lg" style={{ maxWidth: '600px', width: '100%' }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <i className="fas fa-user-plus fa-3x text-primary mb-3"></i>
            <h2 className="card-title">Add Student Contact</h2>
            <button
              onClick={isListening ? stopListening : startListening}
              className={`btn ${isListening ? 'btn-danger' : 'btn-primary'} mt-3`}
            >
              {isListening ? 'Stop Listening' : 'Start Voice Input'}
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="name"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <label htmlFor="name"><i className="fas fa-user me-2"></i>Name</label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="rollNo"
                placeholder="Roll No"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                required
              />
              <label htmlFor="rollNo"><i className="fas fa-id-badge me-2"></i>Roll No</label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="phoneNo"
                placeholder="Phone No"
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
                required
              />
              <label htmlFor="phoneNo"><i className="fas fa-phone-alt me-2"></i>Phone No</label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="yearOfStudy"
                placeholder="Year of Study"
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(e.target.value)}
                required
              />
              <label htmlFor="yearOfStudy"><i className="fas fa-calendar-alt me-2"></i>Year of Study</label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="department"
                placeholder="Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              />
              <label htmlFor="department"><i className="fas fa-building me-2"></i>Department</label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="cgpa"
                placeholder="CGPA"
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                required
              />
              <label htmlFor="cgpa"><i className="fas fa-graduation-cap me-2"></i>CGPA</label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label htmlFor="email"><i className="fas fa-envelope me-2"></i>Email</label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="file"
                className="form-control"
                id="idCard"
                onChange={(e) => setIdCard(e.target.files[0])}
                required
              />
              <label htmlFor="idCard"><i className="fas fa-id-card me-2"></i>Student ID Card</label>
            </div>

            {message && <div className="alert alert-info">{message}</div>}

            <button type="submit" className="btn btn-success w-100">Add Contact</button>
          </form>
          <button className="btn btn-secondary w-100 mt-3" onClick={navigateToViewContacts}>View Contacts</button>
        </div>
      </div>
    </div>
  );
};

export default AddContact;
