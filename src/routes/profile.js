const express = require("express");
const router = express.Router();
const { userAuth } = require("../middlewares/auth");
const { toPublicUser } = require("../utils/userSerializer");
const {
  meetsPasswordStrengthRequirements,
  validateUpdateInput,
} = require("../utils/validation");
const bcrypt = require("bcrypt");
const User = require("../models/user");

router.get("/profile/view", userAuth, (req, res) => {
  res.status(200).json(toPublicUser(req.user));
});

router.patch("/profile/update", userAuth, async (req, res) => {
  const validationErrors = validateUpdateInput(req.body);

  if (validationErrors.length > 0) {
    return res
      .status(400)
      .json({ error: "Invalid update input", details: validationErrors });
  }

  try {
    const updates = { ...req.body };

    if (Object.prototype.hasOwnProperty.call(updates, "gender")) {
      updates.gender = updates.gender.toLowerCase();
    }
    if (Object.prototype.hasOwnProperty.call(updates, "about")) {
      updates.about = updates.about.trim();
    }
    if (Object.prototype.hasOwnProperty.call(updates, "photoUrl")) {
      updates.photoUrl = updates.photoUrl.trim();
    }
    if (Object.prototype.hasOwnProperty.call(updates, "skills")) {
      updates.skills = updates.skills.map((skill) => skill.trim());
    }

    req.user.set(updates);
    const user = await req.user.save();

    return res.status(200).json(toPublicUser(user));
  } catch (error) {
    console.error("Error updating profile:", error);
    if (error.name === "ValidationError") {
      const details = Object.values(error.errors).map(({ path, message }) => ({
        field: path,
        message,
      }));
      return res.status(400).json({ error: "Validation failed", details });
    }
    return res.status(500).json({ error: "Failed to update profile" });
  }
});

router.patch("/profile/password", userAuth, async (req, res) => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({ error: "Request body must be an object" });
  }

  if (
    Object.keys(req.body).some(
      (field) => field !== "currentPassword" && field !== "password",
    )
  ) {
    return res.status(400).json({
      error: "Only currentPassword and password are accepted",
    });
  }

  const { currentPassword, password } = req.body;
  if (typeof currentPassword !== "string" || currentPassword.length === 0) {
    return res.status(400).json({ error: "Current password is required" });
  }
  if (typeof password !== "string" || password.length === 0) {
    return res.status(400).json({ error: "New password is required" });
  }

  if (!meetsPasswordStrengthRequirements(password)) {
    return res.status(400).json({
      error:
        "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol characters.",
    });
  }

  try {
    const user = await User.findById(req.user._id).select("password");
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    const isCurrentPasswordValid = await user.validatePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: "Password validation failed" });
    }
    return res.status(500).json({ error: "Failed to update password" });
  }
});

module.exports = router;
