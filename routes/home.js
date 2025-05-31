const express = require('express');
const router = express.Router();
const Design = require('../models/Design');
const { session } = require('passport');

router.get('/', async (req, res) => {
  try {
    const tagFilter = req.query.tag;
    let designs;

    if (tagFilter) {
      designs = await Design.find({ tags: tagFilter.toLowerCase() }).sort({ createdAt: -1 });
    } else {
      designs = await Design.find().sort({ createdAt: -1 });
    }

    res.render('home', { designs, session: req.session  });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading designs');
  }
});

module.exports = router;
