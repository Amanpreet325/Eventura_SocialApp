const mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/pin");
const plm = require('passport-local-mongoose');
const postModel = require('./post');

const userSchema = mongoose.Schema({
  username: String,
  name: String,
  email: String,
  password: String,
  profileImage: String,
  contact: Number,
  boards: {
    type: Array,
    default: []
  },
  bio: {
    type: String,
    
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'post',
  }],
  role: {
    type: String,
    enum: ['volunteer', 'club', 'sponsor'],
    default: 'volunteer'
  },
  status: { type: String, default: 'pending' },
  // year: String,
  // stream: String,
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user', // reference to a user with role 'club'
  },

  // 🔸 If user is a club: members they have added
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user', // references to users with role 'volunteer'
  }],
});

userSchema.plugin(plm);
module.exports = mongoose.model('user', userSchema);
