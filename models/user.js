// models/user.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  id: String,
  email: String,
  password: String,
  publicKey: String,
  privateKey: String,
});

const User = mongoose.model('User', userSchema, 'registration_data');

module.exports = User;
