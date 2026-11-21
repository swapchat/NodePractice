const AdminAuth = (req, res, next) => {
  const token = req.headers.authorization;
  if (token !== "Bearer mysecrettoken") {
    console.log("Unauthorized access attempt");
    return res.status(401).send("Unauthorized: Invalid token");
  }
  console.log("Authorized access granted");
  next();
};

const userAuth = (req, res, next) => {
  const token = req.headers.authorization;
  if (token !== "Bearer usersecrettoken") {
    console.log("Unauthorized access attempt");
    return res.status(401).send("Unauthorized: Invalid token");
  }
  next();
};

module.exports = { AdminAuth, userAuth };
