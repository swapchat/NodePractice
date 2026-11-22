const express = require("express");
const connectDB = require("./config/database");
const app = express();

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
