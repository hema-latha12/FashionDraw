// models/Design.js
const mongoose = require('mongoose');

const designSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  style: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true // filename of uploaded image
  },
  tags: {
  type: [String],
  default: []
},
  uploadedBy: {
    type: String,
    required: true
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{ type: String }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  comments: [
    {
      user: { type: String, required: true },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  description: {
  type: String,
  default: ''
},
});

module.exports = mongoose.model('Design', designSchema);
