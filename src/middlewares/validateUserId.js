const mongoose = require("mongoose");

const validateUserId = (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.isObjectIdOrHexString(id)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }
  next();
};

module.exports = validateUserId;
