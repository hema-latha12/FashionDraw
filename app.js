// app.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
require('dotenv').config();


const app = express();

// ...existing code...

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
// ...existing code...

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads'));
app.set('view engine', 'ejs');

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.log('MongoDB error:', err);
});

// Routes
const uploadRoutes = require('./routes/upload');
app.use(uploadRoutes);

const authRoutes = require('./routes/authRoutes');
app.use(authRoutes);

const Design = require('./models/Design');
Design.updateMany(
  { tags: { $exists: false } },
  { $set: { tags: [] } }
).then(() => console.log('All designs now have tags array!'));

const likeRoutes = require('./routes/like'); // ✅ NEW
app.use('/like', likeRoutes);                // ✅ NEW


app.get('/', async (req, res) => {
  try {
    const { tag, search } = req.query;
    let query = {};

    if (tag) {
      query.tags = tag.toLowerCase();
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const designs = await Design.find(query).sort({ createdAt: -1 });
    res.render('home', { designs, search: search || '', session: req.session  });
  } catch (err) {
    res.status(500).send('Error fetching designs: ' + err.message);
  }
});


// ...existing code...

app.get('/design/:id', async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) return res.status(404).send('Design not found');
    res.render('design-detail', { design, session: req.session });
  } catch (err) {
    res.status(500).send('Error loading design: ' + err.message);
  }
});

// ...existing code...


app.post('/design/:id/comment', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).send('Login required to comment');
    }
    const { text } = req.body;
    await Design.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { user: req.session.user.username, text } } }
    );
    res.redirect(`/design/${req.params.id}`);
  } catch (err) {
    res.status(500).send('Error adding comment: ' + err.message);
  }
});


// Edit form
app.get('/design/:id/edit', async (req, res) => {
  const design = await Design.findById(req.params.id);
  if (!design) return res.status(404).send('Design not found');
  if (!req.session.user || req.session.user.username !== design.uploadedBy) {
    return res.status(403).send('Unauthorized');
  }
  res.render('edit-design', { design, session: req.session });
});

// Handle edit
app.post('/design/:id/edit', async (req, res) => {
  const design = await Design.findById(req.params.id);
  if (!design) return res.status(404).send('Design not found');
  if (!req.session.user || req.session.user.username !== design.uploadedBy) {
    return res.status(403).send('Unauthorized');
  }
  const { title, style, description, tags } = req.body;
  design.title = title;
  design.style = style;
  design.description = description;
  design.tags = tags.split(',').map(tag => tag.trim().toLowerCase());
  await design.save();
  res.redirect(`/design/${design._id}`);
});

// Handle delete
app.post('/design/:id/delete', async (req, res) => {
  const design = await Design.findById(req.params.id);
  if (!design) return res.status(404).send('Design not found');
  if (!req.session.user || req.session.user.username !== design.uploadedBy) {
    return res.status(403).send('Unauthorized');
  }
  await Design.findByIdAndDelete(req.params.id);
  res.redirect('/');
});


// Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
