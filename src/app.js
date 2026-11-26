const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const {
  meetsPasswordStrengthRequirements,
  validateSignupInput,
} = require("./utils/validation");
const { toPublicUser, toPublicUserList } = require("./utils/userSerializer");
const validateUserId = require("./middlewares/validateUserId");
const app = express();
const bcrypt = require("bcrypt");
const validator = require("validator");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/signup", async (req, res) => {
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

app.post("/login", async (req, res) => {
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
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Failed to process login request" });
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("firstName lastName age gender");
    res.status(200).json(toPublicUserList(users));
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.patch("/user/:id", validateUserId, async (req, res) => {
  const allowedFields = ["password", "age", "gender"];

  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({ error: "Invalid update body" });
  }
  if (Object.keys(req.body).length === 0) {
    return res
      .status(400)
      .json({ error: "Provide at least one field to update" });
  }
  if (Object.keys(req.body).some((field) => !allowedFields.includes(field))) {
    return res.status(400).json({
      error: "Only password, age, and gender can be updated",
    });
  }
  if (
    Object.prototype.hasOwnProperty.call(req.body, "password") &&
    !meetsPasswordStrengthRequirements(req.body.password)
  ) {
    return res.status(400).json({
      error: "Validation failed",
      details: [
        {
          field: "password",
          message:
            "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol characters.",
        },
      ],
    });
  }

  try {
    const userUpdates = {};
    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        userUpdates[field] = req.body[field];
      }
    }
    if (Object.prototype.hasOwnProperty.call(userUpdates, "password")) {
      userUpdates.password = await bcrypt.hash(userUpdates.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      userUpdates,
      {
        returnDocument: "after",
        runValidators: true,
      },
    );
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(toPublicUser(updatedUser));
  } catch (error) {
    console.error("Error updating user:", error);
    if (error.name === "ValidationError") {
      const details = Object.values(error.errors).map(({ path, message }) => ({
        field: path,
        message,
      }));
      return res.status(400).json({ error: "Validation failed", details });
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
