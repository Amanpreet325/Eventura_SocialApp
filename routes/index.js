var express = require('express');
var router = express.Router();
var userModel=require("./users");
const postModel=require('./post');
const passport = require('passport');
const localStrategy=require('passport-local');
passport.use(new localStrategy(userModel.authenticate()));
const upload=require('./multer');
const Venue = require('./venue');
const Booking = require('./booking');
const { isAuthenticated, isClub } = require('./authMiddleware');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index',{nav:false});
});
router.get('/register',function(req,res){
  res.render('register',{nav:false})
})
router.post('/register', function (req, res, next) {
  const data = new userModel({
    username: req.body.username,
    email: req.body.email,
    name: req.body.name,  // Assuming "name" is also part of the form
    bio: req.body.bio,    // Optional bio field
    role: req.body.role   // Capturing the role from the form
  });

  userModel.register(data, req.body.password)
    .then(function () {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/profile");
      });
    })
    .catch(function (error) {
      console.error("Error during registration:", error);
      res.redirect("/register");
    });
});
router.get('/club', isLoggedIn, async function(req, res, next) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });
    if (user.role === 'club') {
      res.render('club', { user, nav: true }); // Render the club.ejs file
    } else {
      res.redirect('/profile'); // Redirect to profile if not a club member
    }
  } catch (error) {
    console.error('Error loading club page:', error);
    res.redirect('/profile');
  }
});
router.get('/volunteer',isLoggedIn,async function(req,res,next){
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });
    if (user.role === 'volunteer') {
      res.render('volunteer', { user, nav: true }); // Render the club.ejs file
    } else {
      res.redirect('/profile'); // Redirect to profile if not a club member
    }
  } catch (error) {
    console.error('Error loading club page:', error);
    res.redirect('/profile');
  }
});
router.get('/profile', isLoggedIn, async function (req, res, next) {
  try {
    // Fetch the logged-in user's data
    const user = await userModel.findOne({ username: req.session.passport.user }).populate("posts");

    if (!user) {
      // Handle case where user data is not found
      return res.status(404).send("User not found");
    }

    // Redirect based on user role
    if (user.role === 'club') {
      return res.render('club', { user, nav: true }); // Render `club.ejs` for club users
    } else if (user.role === 'volunteer') {
      return res.render('volunteer', { user, nav: true }); // Render `volunteer.ejs` for volunteer users
    } else {
      // Default rendering for other roles (if applicable)
      return res.render('profile', { user, nav: true });
    }
  } catch (err) {
    console.error("Error fetching user profile:", err);
    next(err); // Pass the error to the error handler
  }
});

router.get('/show/posts',isLoggedIn,async function(req,res,next){
  const user=await userModel.findOne({username:req.session.passport.user}).populate("posts");
  res.render("show",{user,nav:true});
});
router.get('/show/myposts',isLoggedIn,async function(req,res,next){
  const user=await userModel.findOne({username:req.session.passport.user}).populate("posts");
  res.render("myposts",{user,nav:true});
});
router.get('/add',isLoggedIn,async function(req,res,next){
  const user=await userModel.findOne({username:req.session.passport.user});
  res.render("add",{user,nav:true});
});
router.get('/feed',isLoggedIn,async function(req,res,next){
  const user=await userModel.findOne({username:req.session.passport.user})
  const posts=await postModel.find().populate("user");
  res.render("feed",{user,posts,nav:true});
})
router.post('/createpost',isLoggedIn,upload.single("postimage"),async function(req,res,next){
  const user=await userModel.findOne({username:req.session.passport.user});
  const post=await postModel.create({
    user:user._id,
    caption:req.body.title,
    description:req.body.description,
    image:req.file.filename,

    
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});
router.post('/fileupload',isLoggedIn,upload.single("image"),async function(req,res,next){
  const user=await userModel.findOne({username:req.session.passport.user});
  user.profileImage=req.file.filename;
  await user.save();
  res.redirect("/profile");
});

router.post('/login', passport.authenticate('local', { 
  failureRedirect: '/',
  successRedirect:'/profile',
 }),
  function(req, res) {
    res.redirect('/');
  });
  // Add this route handler for editing user profile

  router.get('/editbio', isLoggedIn, function(req, res) {
    res.render('editbio', { user: req.user, nav: true });
  });
  
  router.post('/editbio', isLoggedIn, async function(req, res) {
    try {
      const user = await userModel.findOne({ username: req.user.username });
      user.bio = req.body.bio;
      if (req.body.username) {
        user.username = req.body.username;
      }
  
        
      
      await user.save();
      res.redirect('/profile');
    } catch (error) {
      console.error('Error updating user bio:', error);
      res.redirect('/profile');
    }
  });

//   router.get('/book-venue', (req, res) => {
//     res.render('bookVenue');
//   });
// // Club books a venue
// router.post('/book-venue', isAuthenticated, isClub, async (req, res) => {
//   try {
//     const { name, location, capacity, date, details } = req.body;

//     const venue = new Venue({
//       name,
//       location,
//       capacity,
//       date,
//       details,
//       bookedBy: req.user._id, // Assuming `req.user` contains the logged-in user's details
//     });

//     await venue.save();
//     res.json({ message: 'Venue booking request submitted' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

router.get('/book-venue',async(req,res)=>{
  res.render('book-venue');
})
router.post('/book-venue', async (req, res) => {
  try {
    const { venueId, date, details } = req.body;

    // Fetch venue details (optional validation)
    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    // Create a new booking
    const newBooking = new Booking({
      venue: venueId,
      date,
      details,
      user: req.user._id, // Assuming the user is authenticated and attached to `req.user`
    });

    await newBooking.save();

    res.render('book-venue'); // Redirect to a page showing user bookings
  } catch (error) {
    console.error('Error booking venue:', error);
    res.status(500).json({ message: 'Error booking venue' });
  }
});
router.get('/places',async(req,res)=>{
  try {
    const venues = await Venue.find({});
    res.render('places', { venues });
  } catch (error) {
    res.status(500).send('Error loading venues');
  }
});
  router.get('/logout', function(req, res, next){
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });
  function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
      return next();
    }
    res.redirect('/');
  }
module.exports = router;
