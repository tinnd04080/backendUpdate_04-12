/* START USER  */
export const ROLE = {
  ADMIN: "ADMIN",
  STAFF: "STAFF",
  CUSTOMER: "CUSTOMER",
};

export const USER_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
};
/* END USER  */

/* Trạng thái hoạt động tuyến, chuyến, xe */
export const ROUTES_STATUS = {
  OPEN: "OPEN",
  CLOSED: "CLOSED",
};

export const TRIP_STATUS = {
  OPEN: "OPEN",
  CLOSED: "CLOSED",
};

export const BUSES_STATUS = {
  OPEN: "OPEN",
  CLOSED: "CLOSED",
};
/* END */

export const PROMOTIONT_STATUS = {
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
};
export const SEAT_STATUS = {
  EMPTY: "EMPTY",
  SOLD: "SOLD",
};
export const PAYMENT_METHOD = {
  OFFLINEPAYMENT: "OFFLINEPAYMENT",
  ZALOPAY: "ZALOPAY",
  PENDING: "PENDING",
};

export const TICKET_STATUS = {
  PAYMENTPENDING: "PAYMENTPENDING",
  PENDING: "PENDING", // chờ xử lý
  INITIAL: "INITIAL",
  PAID: "PAID",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  CANCELED: "CANCELED",
};

/* Trường giá trị giảm giá  */
export const DISCOUNT_TYPE = {
  AMOUNT: "AMOUNT",
  PERCENT: "PERCENT",
};

export const NOTIFICATION_TYPE = {
  PAYMENT_REMIND: "PAYMENT_REMIND", // nhắc thanh toán vé
  TICKET_BOOK_SUCCESS: "TICKET_BOOK_SUCCESS", // thanh toán thành công
  TICKET_BOOK_FAILED: "TICKET_BOOK_FAILED", // thanh toán thất bại
  TICKET_CANCELED: "TICKET_CANCELED", // vé bị huỷ
};

export const PAGINATION = {
  PAGE: 1,
  LIMIT: 10,
};
