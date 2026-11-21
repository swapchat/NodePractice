const express = require("express");
const { AdminAuth, userAuth } = require("./middlewares/auth");

const app = express();

app.use("/admin", AdminAuth);

app.get("/user/login", (req, res) => {
  res.send("User login endpoint accessed successfully");
});

app.get("/user", userAuth, (req, res) => {
  res.send("User endpoint accessed successfully");
});

app.get("/admin/getAllUser", (req, res) => {
  res.send("All users retrieved successfully");
});

app.get("/admin/deleteUser/:id", (req, res) => {
  const userId = req.params.id;
  res.send(`User with ID ${userId} deleted successfully`);
});

app.post("/admin/createUser", (req, res) => {
  res.send("User created successfully");
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
