const config = require("config");

module.exports = function (req, res, next) {
  //console.log(req.user);
  // 401 Unauthorized
  // 403 Forbidden
  if (!config.get("requiresAuth")) return next();

  if (!req.user.isAdmin) return res.status(403).send("Access denied.");

  next();
};
