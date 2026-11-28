const express = require("express");
const router = express.Router();
const { userAuth } = require("../middlewares/auth");
const { toPublicUser } = require("../utils/userSerializer");

router.get("/profile", userAuth, (req, res) => {
  res.status(200).json(toPublicUser(req.user));
});

module.exports = router;
