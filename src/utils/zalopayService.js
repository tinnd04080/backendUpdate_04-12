// Import thư viện axios và các tiện ích
import axios from "axios";
import config from "../config/zalopay.js"; // Đảm bảo đúng đường dẫn
import moment from "moment"; // Import moment
import CryptoJS from "crypto-js";
// Tạo yêu cầu thanh toán
export async function createPaymentToken(orderInfo, amount) {
  const embed_data = {
    redirecturl: "CarBookingApp://payment/success",
    // "https://c6f3-171-234-12-227.ngrok-free.app/api/tickets/callbackPay",
  };

  const items = [{}];
  const transID = Math.floor(Math.random() * 1000000);
  const appTransId = `${moment().format("YYMMDD")}_${transID}`;
  console.log("Generated app_trans_id:", appTransId); // Log app_trans_id
  const order = {
    app_id: config.app_id,
    app_trans_id: appTransId, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
    app_user: orderInfo,
    app_time: Date.now(), // miliseconds
    item: JSON.stringify(items),
    embed_data: JSON.stringify(embed_data),
    amount: amount,
    description: `Lazada - Payment for the order #${transID}`,
    bank_code: "",
    callback_url:
      "https://6e0e-171-234-12-31.ngrok-free.app/api/tickets/callbackPay", // ngrok localhost 8080 . Nhập vào ngrok http 8080
  };

  const data =
    config.app_id +
    "|" +
    order.app_trans_id +
    "|" +
    order.app_user +
    "|" +
    order.amount +
    "|" +
    order.app_time +
    "|" +
    order.embed_data +
    "|" +
    order.item;
  order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();
  console.log("Sending payment request with data:", order); // Log trước khi gửi yêu cầu

  try {
    const result = await axios.post(config.endpoint, null, { params: order });
    console.log("ZaloPay response:", result.data); // Log phản hồi từ ZaloPay
    console.log(result.data);
    return { ...result.data, appTransId };
  } catch (error) {
    console.log(error.message);
  }
}
