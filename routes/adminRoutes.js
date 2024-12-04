const express = require('express');
const multer = require('multer');
const path = require('path');
const passport = require('passport');
const Admin = require('./admin');
const User = require('./users');
const Post = require('./post');
const { checkRole } = require('./authMiddleware'); // To check if the user is an admin
const router = express.Router();
const Venue = require('./venue');
// Admin Login Route
function isAuthenticated(req, res, next) {
    if (req.session.admin) return next();
    return res.redirect('/admin/login');
  }
  router.get('/login', (req, res) => {
    res.render('admin/login');
  });
  
  // Handle admin login
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
  
    if (!admin || admin.password !== password) {
      return res.status(401).render('admin/login', { error: 'Invalid email or password' });
    }
  
    // Set session
    req.session.admin = admin;
    res.redirect('/admin/dashboard');
  });
  
  // Admin dashboard
  router.get('/dashboard', async (req, res) => {
    if (!req.session.admin) {
      return res.redirect('/admin/login');
    }
    try {
        // Fetch pending users, posts, and clubs
        const users = await User.find({ status: 'pending' }); // Fetch users with pending status
        const posts = await Post.find({ status: 'pending' }); // Fetch posts with pending status
        const clubs = await User.find({ role: 'club', status: 'pending' }); // Fetch clubs with pending status
      
        // Ensure content is a string for each post
        posts.forEach(post => {
          post.content = post.content || ''; // Set empty string if content is undefined or null
        });
      
        // Fetch total counts for the dashboard
        const totalUsers = await User.countDocuments();
        const totalPosts = await Post.countDocuments();
        const totalClubs = await User.countDocuments({ role: 'club' });
        const totalSponsors = await User.countDocuments({ role: 'sponsor' });
      
        // Render the dashboard and pass the fetched data to the view
        res.render('admin/dashboard', {
          totalUsers,
          totalPosts,
          totalClubs,
          totalSponsors,
          users,
          posts,
          clubs // Pass the data for pending users, posts, and clubs
        });
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    });
  router.get('/posts', isAuthenticated, async (req, res) => {
    try {
      const pendingPosts = await Post.find({ status: 'pending' });
      res.render('admin/posts', { posts: pendingPosts });
    } catch (error) {
      res.status(500).send('Error fetching posts');
    }
  });
  
  // Route to approve a post
  router.put('/approve-post/:id', isAuthenticated, async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ message: 'Post not found' });
  
      post.status = 'approved'; // Approve the post
      await post.save();
      res.status(200).json({ message: 'Post approved successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error approving post', error });
    }
  });
  
  
  // Admin logout
  router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
  });
  

// Admin Route to Approve/Reject User
router.put('/approve-user/:id', checkRole(['superAdmin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Approve or Reject user
    user.status = req.body.status; // Can be 'approved' or 'rejected'
    await user.save();

    res.status(200).json({ message: `User ${user.status} successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Error approving user', error });
  }
});

// Admin Route to Delete User
router.delete('/delete-user/:id',  async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
});
router.delete('/delete-club/:id',  async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
});

// Admin Route to Delete a Post
router.delete('/delete-post/:id', async (req, res) => {
    // Assuming you're using a middleware that adds user info to the request
   
  
    const postId = req.params.id;
  
    try {
      const deletedPost = await Post.findByIdAndDelete(postId);
  
      if (!deletedPost) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      res.json({ message: 'Post successfully deleted' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error deleting post  BACKE' });
    }
  });
  
  router.post('/approve-venue/:id', async (req, res) => {
    try {
      const venue = await Venue.findById(req.params.id);
      if (!venue) return res.status(404).json({ message: 'Venue not found' });
  
      venue.status = 'approved';
      venue.locked = true;
      await venue.save();
      res.json({ message: 'Venue booking approved and locked' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Reject a venue booking
  router.post('/reject-venue/:id', async (req, res) => {
    try {
      const venue = await Venue.findById(req.params.id);
      if (!venue) return res.status(404).json({ message: 'Venue not found' });
  
      venue.status = 'rejected';
      await venue.save();
      res.json({ message: 'Venue booking rejected' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  const storage = multer.diskStorage({
    destination: './public/uploads',
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });
  const upload = multer({ storage });
  router.get('/add-venue',async(req,res)=>{
    res.render('admin/addVenue');
  });
  router.post('/add-venue', upload.single('image'), async (req, res) => {
    try {
      const { name, location, capacity, description } = req.body;
      const newVenue = new Venue({
        name,
        location,
        capacity,
        description,
        imageUrl: `/uploads/${req.file.filename}`,
      });
      await newVenue.save();
      res.redirect('/admin/venues'); // Redirect to the admin venue list
    } catch (error) {
      res.status(500).send('Error adding venue');
    }
  });
module.exports = router;
