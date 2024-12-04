const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  details: { type: String, required: true },
  status: { type: String, default: 'Pending' }, // Approval status: Pending/Approved/Rejected
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
