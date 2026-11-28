const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const validator = require("validator");
const User = require("../models/user");
const { validateSignupInput } = require("../utils/validation");

router.post("/signup", async (req, res) => {
  const validationErrors = validateSignupInput(req.body);

  if (validationErrors.length > 0) {
    return res
      .status(400)
      .json({ error: "Invalid signup request", details: validationErrors });
  }

  try {
    const { firstName, lastName, email, password, age, gender } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      age,
      gender,
    });
    await user.save();
    return res.status(200).json({ message: "Signup request processed" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({ message: "Signup request processed" });
    }
    if (error.name === "ValidationError") {
      console.warn(
        "Signup validation failed for fields:",
        Object.keys(error.errors).join(", "),
      );
      const details = Object.values(error.errors).map(({ path, message }) => ({
        field: path,
        message,
      }));
      return res.status(400).json({ error: "Validation failed", details });
    }
    console.error("Error saving user:", error);
    res.status(500).json({ error: "Failed to save user" });
  }
});

router.post("/login", async (req, res) => {
  try {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({ error: "Login body must be an object" });
    }

    const { email, password } = req.body;
    if (
      email === undefined ||
      email === null ||
      password === undefined ||
      password === null
    ) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    if (typeof email !== "string" || typeof password !== "string") {
      return res
        .status(400)
        .json({ error: "Email and password must be strings" });
    }
    if (!email.trim() || password.length === 0) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!validator.isEmail(normalizedEmail)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = await user.getJWT();
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Failed to process login request" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
  res.status(200).json({ message: "Logout successful" });
});

module.exports = router;
