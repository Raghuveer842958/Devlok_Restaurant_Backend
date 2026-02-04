module.exports = role => (req, res, next) =>
    req.user.role === role ? next() : res.sendStatus(403);
  