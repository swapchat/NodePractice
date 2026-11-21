const express = require("express");
require("./config/database"); // Import the database connection
const app = express();

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
