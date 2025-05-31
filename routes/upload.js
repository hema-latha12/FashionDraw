// routes/upload.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const Design = require('../models/Design');

const router = express.Router();

// Storage settings for Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage: storage });

// Show upload form
router.get('/upload', (req, res) => {
  res.render('upload');
});

// Handle upload form submission
router.post('/upload', upload.single('image'), async (req, res) => {
  const { title, style, description } = req.body;
  const image = req.file.filename;

  const tagsArray = req.body.tags
  ? req.body.tags.split(',').map(tag => tag.trim().toLowerCase())
  : [];


  try {
    const newDesign = new Design({
      title,
      style,
      image,
      uploadedBy: req.session.user.username, // Static for now
      tags: tagsArray,
      description
    });

    await newDesign.save();
    res.redirect('/');
  } catch (err) {
    res.status(500).send('Upload failed,  "Just SignUp Yaar!": ' + err.message,);
  }
});

module.exports = router;
