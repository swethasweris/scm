import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import AddContact from './components/AddContact';
import ViewContacts from './components/ViewContacts';
import CreateGroup from './components/CreateGroup'; // Import CreateGroup component
import ViewGroups from './components/ViewGroups'; // Import ViewGroups component
import HomePage from './components/HomePage';
import StudentRegister from './components/StudentRegister';
import StudentLogin from './components/StudentLogin';
import StudentDashboard from './components/StudentDashboard';
import './components/styles.css';

function App() {
  return (
    <Router>
      <div className="container py-4">
        <Routes>
        <Route path="/" element={<HomePage />} />
          <Route path="/" element={<Navigate to="/HomePage" />} />  {/* Default route */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/add-contact" element={<AddContact />} />
          <Route path="/view-contacts" element={<ViewContacts />} />
          <Route path="/create-group" element={<CreateGroup />} /> {/* Add CreateGroup route */}
          <Route path="/view-groups" element={<ViewGroups />} /> {/* Add ViewGroups route */}
          <Route path="/studentregister" element={<StudentRegister />} />
        <Route path="/studentlogin" element={<StudentLogin />} />
        <Route path="/studentdashboard" element={<StudentDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}
export default App;
