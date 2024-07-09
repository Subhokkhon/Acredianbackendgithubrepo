const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
const prisma = new PrismaClient();

app.use(bodyParser.json());

// Middleware for validating referral data
const validateReferralData = (req, res, next) => {
  const { referrer, referee, email, course } = req.body;
  if (!referrer || !referee || !email || !course) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  // Additional validation logic can be added here
  next();
};

// Function to send referral email
const sendReferralEmail = async (referral) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your-email@gmail.com',
      pass: 'your-email-password'
    }
  });

  const mailOptions = {
    from: 'your-email@gmail.com',
    to: referral.email,
    subject: 'Referral Confirmation',
    text: `Hello ${referral.referee},\n\n${referral.referrer} has referred you for the course: ${referral.course}.\n\nBest regards,\nYour Team`
  };

  await transporter.sendMail(mailOptions);
};

// Route for handling referrals (POST method)
app.post('/api/referrals', validateReferralData, async (req, res) => {
  const { referrer, referee, email, course } = req.body;

  try {
    const newReferral = await prisma.referral.create({
      data: {
        referrer,
        referee,
        email,
        course
      }
    });
    await sendReferralEmail(newReferral);
    res.status(201).json(newReferral);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create referral' });
  }
});

// Default route handler for GET requests to the root path
app.get('/', (req, res) => {
  res.send('Welcome to the Refer & Earn API. Use POST method on /api/referrals to submit a referral.');
});

// Middleware for error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
