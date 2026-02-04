const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  // console.log("hello-1 from the auth middleware");
  // if (!token) return res.sendStatus(401);

  // console.log("hello-2 from the auth middleware");

  // req.user = jwt.verify(token, process.env.JWT_SECRET);
  next();
};
