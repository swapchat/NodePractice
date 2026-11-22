const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  age: Number,
  gender: String,
});

const User = mongoose.model("User", userSchema);

module.exports = User;
