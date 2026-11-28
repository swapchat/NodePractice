const express = require("express");
const router = express.Router();
const { userAuth } = require("../middlewares/auth");
const { toPublicUser } = require("../utils/userSerializer");
const { validateUpdateInput } = require("../utils/validation");

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

module.exports = router;
