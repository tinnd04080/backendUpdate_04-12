import crypto from "crypto"; // Sử dụng cú pháp import
import config from "../config/zalopay.js"; // Đảm bảo đường dẫn đúng và có phần mở rộng .js

// Hàm tạo chữ ký từ dữ liệu
export function generateSignature(data) {
  return crypto
    .createHmac("sha256", config.app_secret)
    .update(data)
    .digest("hex");
}

// Hàm kiểm tra chữ ký
export function verifySignature(data, mac) {
  const signature = generateSignature(data);
  return signature === mac;
}
