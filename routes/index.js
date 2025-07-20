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
const axios = require("axios");
const cors = require("cors");
const mongoose = require("mongoose");


router.use(cors());
// OpenAI Setup


// Ensure API key is set in environment variables

router.get('/', function(req, res, next) {
  res.render('index',{nav:false});
});
const MISTRAL_API_KEY = "YjkDQW2cu63lJcJcHjudKjvEAu0FKDTD"; // Add your API key in a .env file

const ChatMessage = require('./ChatMessage');
router.get('/chatting/history/:receiverId', async (req, res) => {
  const sender = req.user._id;
  const receiver = req.params.receiverId;

  const messages = await ChatMessage.find({
    $or: [
      { sender, receiver },
      { sender: receiver, receiver: sender }
    ]
  }).sort({ timestamp: 1 });

  res.json(messages);
});


router.get('/chatting', async (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/');

  try {
    let user = await userModel.findOne({ username: req.session.passport.user });
    user = await userModel.findById(user._id); // Populate if needed
  
    const users = await userModel.find({ _id: { $ne: user._id } });
    console.log(users);
    res.render('chatting', {
      user,    // 👈 this matches your EJS expectation
      users,   // List of other users
    });
  } catch (err) {
    console.error('Error loading chatting page:', err);
    res.status(500).send('Internal Server Error');
  }
});
router.post('/chatting/send', async (req, res) => {
  const senderId = req.user?._id || req.session.passport.user;  // fallback
  const { receiver, message } = req.body;
  console.log("POST /chatting/send", { senderId, receiver, message });

  if (!senderId || !receiver || !message) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const msg = new ChatMessage({
      sender: senderId,
      receiver,
      message
    });

    await msg.save();
    res.status(200).json({ message: "Message saved", data: msg });
  } catch (err) {
    console.error("Error saving message:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  let venues = await Venue.find({});
  let venueList = venues.map((v) => `${v.name} in ${v.location} `).join("\n");

  const prompt = `
  You are an AI assistant helping users book events. Follow this step-by-step process:
  1. Suggest upcoming events.
  2. Ask user for event name & date.
  3. Show available venues from database: 
     ${venueList}
  4. Ask for the user's name.
  5. Confirm details and save booking in database.
  6. If user asks about a booked event, retrieve it from DB.

  User: ${userMessage}
  AI: 
  `;

  try {
      const response = await axios.post(
          "https://api.mistral.ai/v1/chat/completions",
          {
              model: "mistral-medium",
              messages: [{ role: "system", content: prompt }],
              max_tokens: 200,
          },
          {
              headers: {
                  "Authorization": `Bearer ${MISTRAL_API_KEY}`,
                  "Content-Type": "application/json",
              },
          }
      );

      const aiResponse = response.data.choices[0].message.content;

      // Detect if an event is mentioned and return booking action
      let action = null;
      if (userMessage.includes("book this event") && venues.length > 0) {
        action = {
            type: "book_event",
            label: "Book This Event",
            eventData: {
                eventName: "Suggested Event",
                date: "2025-04-01", // Example date (Can be dynamic)
                venue: venues[0].name // Choose the first venue
            }
        };
    }

      return res.json({
          reply: aiResponse,
          action
      });

  } catch (error) {
      console.error("Mistral AI API Error:", error);
      res.status(500).json({ error: "AI service is unavailable." });
  }
});



const { isAuthenticated, isClub } = require('./authMiddleware');
router.get("/budget", (req, res) => {
  res.render("budget");
});
router.post("/calculate-budget", (req, res) => {
  const { attendees, foodCost, decorationCost, entertainmentCost, registrationFee } = req.body;

  const numAttendees = parseInt(attendees) || 0;
  const food = parseInt(foodCost) * numAttendees || 0;
  const decoration = parseInt(decorationCost) || 0;
  const entertainment = parseInt(entertainmentCost) || 0;
  const registration = parseInt(registrationFee) * numAttendees || 0;
  
  const miscellaneous = (food + decoration + entertainment) * 0.1; // 10% extra

  const totalBudget = food + decoration + entertainment + miscellaneous - registration;

  res.render("budget-result", { totalBudget });
});
/* GET home page. */
router.post("/like/:id", async (req, res) => {
  try {
      const postId = req.params.id;
      const userId = req.body.userId;

      if (!mongoose.Types.ObjectId.isValid(postId)) {
          return res.status(400).json({ message: "Invalid post ID format" });
      }

     

      const post = await postModel.findById(postId);
      if (!post) {
          return res.status(404).json({ message: "Post not found" });
      }

      const userObjectId = new mongoose.Types.ObjectId(userId);

      // Toggle like
      if (post.likes.some((id) => id.toString() === userId)) {
          post.likes = post.likes.filter((id) => id.toString() !== userId);
      } else {
          post.likes.push(userObjectId);
      }

      await post.save();
      res.status(200).json({ message: "Like updated successfully", likes: post.likes.length });
  } catch (error) {
      console.error("Error liking post:", error);
      res.status(500).json({ message: "Server error", error: error.message });
  }
});
router.get('/register',function(req,res){
  res.render('register',{nav:false})
})
router.post('/register', function (req, res, next) {
  const data = new userModel({
    username: req.body.username,
    email: req.body.email,
    name: req.body.name,
    contact:req.body.contact,  // Assuming "name" is also part of the form
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
      user = await userModel.findById(user._id).populate("posts").populate("members");
      return res.render('club', { user, nav: true });
       // Render the club.ejs file
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
    let user = await userModel.findOne({ username: req.session.passport.user }).populate("posts");

    if (!user) {
      // Handle case where user data is not found
      return res.status(404).send("User not found");
    }

    // Redirect based on user role
    if (user.role === 'club') {
      user = await userModel.findById(user._id).populate("posts").populate("members");
      return res.render('club', { user, nav: true });
       // Render `club.ejs` for club users
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
router.post('/club/add-member', isClub, async (req, res) => {
  const { username, contact } = req.body;

  try {
    const volunteer = await userModel.findOne({ username: username, contact: contact, role: 'volunteer' });

    if (!volunteer) {
      return res.send('Volunteer not found with the given name and contact.');
    }

    // Update volunteer details
    // volunteer.year = year;
    // volunteer.stream = stream;
    volunteer.club = req.user._id;
    await volunteer.save();

    // Add volunteer to club's members array
    const club = await userModel.findById(req.user._id);
    if (!club.members.includes(volunteer._id)) {
      club.members.push(volunteer._id);
      await club.save();
    }

    res.redirect('/profile'); // redirect back to club dashboard
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
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
  // app.post("/chat", async (req, res) => {
  //   const userMessage = req.body.message;
    
  //   let venues = await Venue.find({});
  //   let venueList = venues.map((v) => `${v.name} in ${v.location} (₹${v.price})`).join("\n");
  
  //   const prompt = `
  //   You are an AI assistant helping users book events. Follow this step-by-step process:
  //   1. Suggest upcoming events.
  //   2. Ask user for event name & date.
  //   3. Show available venues from database: 
  //      ${venueList}
  //   4. Ask for the user's name.
  //   5. Confirm details and save booking in database.
  //   6. If user asks about a booked event, retrieve it from DB.
  
  //   User: ${userMessage}
  //   AI: 
  //   `;
  
  //   const response = await openai.createChatCompletion({
  //     model: "gpt-4",
  //     messages: [{ role: "system", content: prompt }],
  //     max_tokens: 200,
  //   });
  
  //   res.json({ reply: response.data.choices[0].message.content });
  // });
  
  // API to save booking
  router.post("/book-event", async (req, res) => {
    try {
        const { eventName, date, venue, userName } = req.body;

        // Find venue by name
        const venueDoc = await Venue.findOne({ name: venue });
        if (!venueDoc) {
            return res.status(400).json({ error: "Venue not found." });
        }

        // Find user by name
        const userDoc = await userModel.findOne({ name: userName });
        if (!userDoc) {
            return res.status(400).json({ error: "User not found." });
        }

        // Create a new booking with ObjectId references
        const booking = new Booking({
            eventName,
            date,
            venue: venueDoc._id, // Store venue as ObjectId
            user: userDoc._id, // Store user as ObjectId
            details: "Some event details here"
        });

        await booking.save();
        res.json({ success: true, message: "Event booked successfully!" });
    } catch (error) {
        console.error("Booking Error:", error);
        res.status(500).json({ error: "Booking failed." });
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
