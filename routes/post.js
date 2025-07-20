// Import Mongoose
const mongoose = require('mongoose');

// Define the Post Schema
const postSchema = new mongoose.Schema({
  caption: {
    type: String,
    required: true,
  },
  image:{
    type:String,
  },
  createdAt: {
    type: Date,
    default:Date.now,
  },
  description:{
    type: String,
    
  },
  hashtags:{
    type:String,
  },
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user',
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  status: { type: String, default: 'pending' },
  
});

// Create the Post model


// Export the Post model
module.exports=mongoose.model('post', postSchema);
