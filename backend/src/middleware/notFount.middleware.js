const messages = require("../utils/messages");

module.exports = (req, res) => {
  return res.notFound(
    `${req.method} ${req.originalUrl} route not found.`
  );
};