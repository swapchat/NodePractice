const mongoose = require("mongoose");
const { Schema } = mongoose;
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET in .env");
}

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 4,
      maxlength: 20,
    },
    lastName: {
      type: String,
      trim: true,
      minlength: 4,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 50,
      validate: {
        validator: (value) => validator.isEmail(value),
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    password: {
      type: String,
      required: true,
      validate: {
        validator: (value) =>
          validator.isStrongPassword(value, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
          }),
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol.",
      },
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      lowercase: true,
    },
    about: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    photoUrl: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: (value) =>
          value === "" ||
          validator.isURL(value, {
            protocols: ["http", "https"],
            require_protocol: true,
          }),
        message: "Photo URL must be a valid HTTP or HTTPS URL",
      },
    },
    skills: {
      type: [
        {
          type: String,
          trim: true,
          minlength: 1,
          maxlength: 30,
        },
      ],
      default: [],
      validate: {
        validator: (skills) => skills.length <= 5,
        message: "A maximum of 5 skills is allowed",
      },
    },
  },
  { timestamps: true },
);

userSchema.methods.getJWT = function () {
  const user = this;
  const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
    expiresIn: "7d",
  });
  return token;
};

userSchema.methods.validatePassword = async function (inputPassword) {
  const user = this;
  const hashedPassword = user.password;
  return await bcrypt.compare(inputPassword, hashedPassword);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
