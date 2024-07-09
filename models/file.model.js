const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  image: { type: String },
  boldText: { type: String },
  text: { type: String},
  //createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('File', userSchema);
