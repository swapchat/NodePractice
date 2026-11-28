const express = require("express");
const router = express.Router();
const { userAuth } = require("../middlewares/auth");

router.post("/sendConnectionRequest", userAuth, (req, res) => {
  const { firstName } = req.user;
  res.status(200).json({ message: `${firstName} sent the connection request` });
});

module.exports = router;
