// routes/referrals.js

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// POST /api/referrals
router.post('/', async (req, res, next) => {
  try {
    const { referrerName, referrerEmail, refereeName, refereeEmail } = req.body;

    // Validate request data
    if (!referrerName || !referrerEmail || !refereeName || !refereeEmail) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Save referral data to database
    const referral = await prisma.referral.create({
      data: {
        referrerName,
        referrerEmail,
        refereeName,
        refereeEmail,
      },
    });

    // Handle successful creation
    return res.status(201).json(referral);

  } catch (error) {
    next(error);
  }
});

module.exports = router;
