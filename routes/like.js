const express = require('express');
const router = express.Router();
const Design = require('../models/Design');

// POST /like/:id
router.post('/:id', async (req, res) => {
  if (!req.session.user) {
    return res.json({ success: false, message: 'Login required' });
  }
  const design = await Design.findById(req.params.id);
  if (!design) return res.json({ success: false, message: 'Design not found' });

  // Check if user already liked
  if (design.likedBy.includes(req.session.user.username)) {
    return res.json({ success: false, message: 'Already liked', likes: design.likes });
  }

  design.likes += 1;
  design.likedBy.push(req.session.user.username);
  await design.save();

  res.json({ success: true, likes: design.likes });
});
module.exports = router;
