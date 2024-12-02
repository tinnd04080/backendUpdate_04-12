const { verifySignature } = require("../utils/cryptoUtils");

function verifyZaloPaySignature(req, res, next) {
  const { data, mac } = req.body;

  // Kiểm tra chữ ký hợp lệ
  if (!verifySignature(data, mac)) {
    return res.status(400).json({ error: "Invalid signature" });
  }

  next();
}

module.exports = verifyZaloPaySignature;
