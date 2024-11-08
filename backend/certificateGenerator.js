const express = require('express');
const nodemailer = require('nodemailer'); // Use this package to send emails
const router = express.Router();
const Contact = require('./models/Contact'); // Adjust the path as necessary

// Generate certificate for the top student
router.post('/generate-certificate', async (req, res) => {
  const { email } = req.body;

  try {
    // Configure nodemailer
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'your-email@gmail.com', // Replace with your email
        pass: 'your-email-password' // Replace with your email password
      }
    });

    const mailOptions = {
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Certificate of Excellence',
      text: 'Congratulations! You are the top student with CGPA XYZ.',
      // You can create a PDF or image of the certificate to attach here.
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Certificate sent successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending certificate' });
  }
});

module.exports = router;
