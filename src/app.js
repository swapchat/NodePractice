const express = require("express");
const connectDB = require("./config/database");
const mongoose = require("mongoose");
const User = require("./models/user");
const app = express();

const validateUserId = (req, res, next) => {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }
  next();
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/signup", async (req, res) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    console.error("Error saving user:", error);
    if (error.code === 11000) {
      return res.status(409).json({ error: "Email already exists" });
    }
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ error: "Invalid signup data" });
    }
    res.status(500).json({ error: "Failed to save user" });
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.patch("/user/:id", validateUserId, async (req, res) => {
  const allowedFields = ["firstName", "lastName", "age", "gender"];
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({ error: "Invalid update body" });
  }
  if (Object.keys(req.body).some((field) => !allowedFields.includes(field))) {
    return res.status(400).json({
      error: "Only firstName, lastName, age, and gender can be updated",
    });
  }
  if (Object.keys(req.body).length === 0) {
    return res
      .status(400)
      .json({ error: "Provide at least one field to update" });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ error: "Invalid update data" });
    }
    res.status(500).json({ error: "Failed to update user" });
  }
});

app.delete("/user/:id", validateUserId, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json("User deleted successfully");
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

connectDB()
  .then(() => {
    console.log("Connected to Database");
    app.listen(3000, () => {
      console.log("Server listening on port 3000");
    });
  })
  .catch((error) => {
    console.error("Error connecting to Database:", error);
  });
