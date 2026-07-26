const express = require("express");

const app = express();

app.get("/user", (req, res) => {
  res.send({
    firstName: "Swapnil",
    lastName: "Chaturvedi",
  });
});

app.post("/user", (req, res) => {
  res.send("User created");
});

app.delete("/user", (req, res) => {
  res.send("User deleted");
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
