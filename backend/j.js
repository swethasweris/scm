const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');

// Configure the email transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-email-password',
  },
});

// Function to send email notifications
const sendEmailNotification = (emails) => {
  const mailOptions = {
    from: 'your-email@gmail.com',
    to: emails,
    subject: 'You are a Class Representative!',
    text: 'Congratulations! You have been selected as a class representative.',
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/TeacherContactsDB')
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Teacher schema and model
const teacherSchema = new mongoose.Schema({
  username: String,
  password: String,
});
const Teacher = mongoose.model('Teacher', teacherSchema);

// Student schema and model
const studentSchema = new mongoose.Schema({
  name: String,
  rollNo: String,
  phoneNo: String,
  yearOfStudy: Number,
  department: String,
  cgpa: Number,
  idCard: String,
  email: String,
  lastUpdated: { type: Date, default: Date.now },
  isArchived: { type: Boolean, default: false },
  isClassRepresentative: { type: Boolean, default: false },
});
const Student = mongoose.model('Student', studentSchema);

// Group schema and model
const groupSchema = new mongoose.Schema({
  groupName: String, // New field name
  mentor: String,
  members: [{ 
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    name: String
  }],
});
const Group = mongoose.model('Group', groupSchema);

// Configure storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Error: Only images and PDFs are allowed');
    }
  },
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: 'No token provided' });
  jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
    if (err) return res.status(500).json({ message: 'Failed to authenticate token' });
    req.teacherId = decoded.id;
    next();
  });
};

// Register route
app.post('/register', async (req, res) => {
  console.log('Registering new teacher:', req.body.username);
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newTeacher = new Teacher({ username, password: hashedPassword });
    await newTeacher.save();
    console.log('Teacher registered successfully:', username);
    res.json({ message: 'Teacher registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering teacher', error: error.message });
  }
});

// Login route
app.post('/login', async (req, res) => {
  console.log('Login attempt:', req.body.username);
  try {
    const { username, password } = req.body;
    const teacher = await Teacher.findOne({ username });
    if (!teacher || !(await bcrypt.compare(password, teacher.password))) {
      console.log('Invalid login attempt for:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: teacher._id }, 'your_jwt_secret');
    console.log('Login successful:', username);
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Add contact route
app.post('/add-contact', verifyToken, upload.single('idCard'), async (req, res) => {
  console.log('Adding new contact:', req.body);
  try {
    const { name, rollNo, phoneNo, yearOfStudy, department, cgpa, email } = req.body;
    const idCard = req.file ? req.file.path : '';
    const newStudent = new Student({ name, rollNo, phoneNo, yearOfStudy, department, cgpa, idCard, email });
    await newStudent.save();
    console.log('Contact added successfully:', newStudent);
    res.json({ message: 'Contact added successfully' });
  } catch (error) {
    console.error('Error adding contact:', error);
    res.status(500).json({ message: 'Error adding contact', error: error.message });
  }
});

// View contacts route
app.get('/view-contacts', verifyToken, async (req, res) => {
  const { archived } = req.query;
  console.log('Fetching contacts, archived:', archived);
  try {
    const filter = archived === 'true' ? { isArchived: true } : { isArchived: false };
    const students = await Student.find(filter).sort({ cgpa: -1 });
    console.log(`Found ${students.length} contacts`);
    res.json(students);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ message: 'Error fetching contacts', error: error.message });
  }
});

// Archive Contact Endpoint
app.put('/archive-contact/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  console.log(`Archiving contact ${id}`);
  try {
    const { isArchived } = req.body;
    const student = await Student.findByIdAndUpdate(
      id,
      { isArchived },
      { new: true }
    );
    console.log('Contact archive status updated:', student);
    res.json({ message: `Contact ${isArchived ? 'archived' : 'unarchived'} successfully` });
  } catch (error) {
    console.error('Error archiving contact:', error);
    res.status(500).json({ message: 'Error updating archive status', error: error.message });
  }
});

// Edit contact endpoint
app.put('/edit-contact/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  console.log(`Editing contact ${id}:`, req.body);
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );
    console.log('Contact updated:', updatedStudent);
    res.json({ message: 'Contact updated successfully', student: updatedStudent });
  } catch (error) {
    console.error('Error editing contact:', error);
    res.status(500).json({ message: 'Error editing contact', error: error.message });
  }
});

// Delete contact endpoint
app.delete('/delete-contact/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  console.log(`Deleting contact ${id}`);
  try {
    const deletedStudent = await Student.findByIdAndDelete(id);
    console.log('Contact deleted:', deletedStudent);
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ message: 'Error deleting contact', error: error.message });
  }
});

// Create group endpoint
app.post('/create-group', verifyToken, async (req, res) => {
  console.log('Creating new group:', req.body);
  try {
    const { groupName, mentorName, members } = req.body;
    const memberDetails = await Student.find({ _id: { $in: members } }).select('name');
    const membersWithNames = memberDetails.map(student => ({
      studentId: student._id,
      name: student.name,
    }));
    const newGroup = new Group({ groupName: groupName, mentor: mentorName, members: membersWithNames });
    await newGroup.save();
    console.log('Group created:', newGroup);
    res.json({ message: 'Group created successfully', group: newGroup });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ message: 'Error creating group', error: error.message });
  }
});

// View groups endpoint
app.get('/view-groups', verifyToken, async (req, res) => {
  console.log('Fetching groups');
  try {
    const groups = await Group.find().populate('members.studentId', 'name');
    console.log(`Found ${groups.length} groups`);
    res.json(groups);
    console.log(groups); // Log the groups to check their structure

  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ message: 'Error fetching groups', error: error.message });
  }
});

// Update group endpoint
app.put('/update-group/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  console.log(`Updating group ${id}:`, req.body);
  try {
    const { groupName, mentorName, members } = req.body;
    const memberDetails = await Student.find({ _id: { $in: members } }).select('name');
    const membersWithNames = memberDetails.map(student => ({
      studentId: student._id,
      name: student.name,
    }));
    const updatedGroup = await Group.findByIdAndUpdate(
      id,
      { groupName: groupName, mentor: mentorName, members: membersWithNames },
      { new: true }
    );
    console.log('Group updated:', updatedGroup);
    res.json({ message: 'Group updated successfully', group: updatedGroup });
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ message: 'Error updating group', error: error.message });
  }
});

// Delete group endpoint
app.delete('/delete-group/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  console.log(`Deleting group ${id}`);
  try {
    const deletedGroup = await Group.findByIdAndDelete(id);
    console.log('Group deleted:', deletedGroup);
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ message: 'Error deleting group', error: error.message });
  }
});

// Available students endpoint
app.get('/available-students', verifyToken, async (req, res) => {
  console.log('Fetching available students');
  try {
    const students = await Student.find({ isArchived: false }).select('name');
    console.log(`Found ${students.length} available students`);
    res.json(students);
  } catch (error) {
    console.error('Error fetching available students:', error);
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
});

// Auto-update student year of study
setInterval(async () => {
  try {
    const now = new Date();
    console.log('Running auto-update for student year of study');
    
    const result = await Student.updateMany(
      {
        lastUpdated: { $lt: new Date(now.getTime() - 20 * 1000) },
        yearOfStudy: { $lt: 4 }
      },
      {
        $inc: { yearOfStudy: 1 },
        $set: { lastUpdated: now }
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`Updated year of study for ${result.modifiedCount} student(s)`);
    }
  } catch (error) {
    console.error('Error in auto-update:', error);
  }
}, 20 * 1000);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
