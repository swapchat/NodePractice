const express = require("express");

const app = express();

app.use(
  "/user",
  (req, res, next) => {
    console.log("user route created 1");
    next();
  },
  (req, res, next) => {
    console.log("user route created 2");
    next();
  },
  (req, res, next) => {
    console.log("user route created 3");
    res.send("user route created 3");
  },
);

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
