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
    default: 'Doper',
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
});

userSchema.plugin(plm);
module.exports = mongoose.model('user', userSchema);
