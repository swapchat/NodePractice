const express = require("express");

const app = express();

//Route level error handling
app.get("/user", (req, res, next) => {
  try {
    throw new Error("Simulated error in /user route");
  } catch (error) {
    console.error("Error in /user route:", error);
    res.status(500).send("Something went wrong in /user route");
    //next(error); // Pass the error to the global error handler
  }
});

//optional handler & always use global error handling middleware at the end of all routes
app.use("/", (err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).send("Something went wrong");
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
