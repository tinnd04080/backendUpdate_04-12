import {
  DISCOUNT_TYPE,
  NOTIFICATION_TYPE,
  PAGINATION,
  ROLE,
  SEAT_STATUS,
  TICKET_STATUS,
  PAYMENT_METHOD,
  PROMOTIONT_STATUS,
} from "../constants/index.js";
import Tickets from "../models/tickets.js";
import randomNumber from "../utils/randomNumber.js";
import Bus from "../models/bus.js";
import createVNPayPaymentUrl from "../utils/payment.js";
import Notification from "../models/notifications.js";
import Trip from "../models/trips.js";
import Seat from "../models/seats.js";
import Promotion, { PromotionUsage } from "../models/promotion.js";
import Seats from "../models/seats.js";
import Permission from "../models/permissions.js";
import BusRoutes from "../models/busRoutes.js";
import qs from "qs";
import crypto from "crypto";
import dayjs from "dayjs";
import { createPaymentToken } from "../utils/zalopayService.js";
import config from "../config/zalopay.js"; // Đảm bảo đường dẫn đúng và có phần mở rộng .js
import CryptoJS from "crypto-js";
import axios from "axios";
const getListTicket = async (page, limit, queryObj = {}) => {
  const tickets = await Tickets.find(queryObj)
    .sort("-createdAt")
    .skip((page - 1) * limit)
    .limit(limit * 1)
    .populate(["user", "trip"])
    .exec();

  const count = await Tickets.countDocuments();

  const totalPage = Math.ceil(count / limit);
  const currentPage = Number(page);

  return {
    tickets,
    totalPage,
    currentPage,
  };
};

const updateSeatStt = async ({ tripId, seatNumber, status }) => {
  const updateSeatTask = seatNumber.map((seatName) => {
    return Seat.findOneAndUpdate(
      {
        trip: tripId,
        seatNumber: seatName,
      },
      {
        status,
      }
    );
  });
  await Promise.all(updateSeatTask);
};

export const ticketUpdateStt = async ({ ticketId, status }) => {
  const ticket = await Tickets.findByIdAndUpdate(
    ticketId,
    {
      status,
    },
    { new: true }
  )
    .populate("trip")
    .exec();
  // In dữ liệu của ticket ra console
  //console.log("Dữ liệu của ticket:", ticket);
  // save notification
  switch (status) {
    case TICKET_STATUS.CANCELED: {
      await new Notification({
        ticket: ticket._id,
        type: NOTIFICATION_TYPE.TICKET_CANCELED,
        user: ticket.user,
      }).save();

      // cập nhật trạng thái => ghế trống
      await updateSeatStt({
        tripId: ticket.trip._id,
        seatNumber: ticket.seatNumber,
        status: SEAT_STATUS.EMPTY,
      });
      break;
    }

    case TICKET_STATUS.PAYMENT_FAILED: {
      await new Notification({
        ticket: ticket._id,
        type: NOTIFICATION_TYPE.TICKET_BOOK_FAILED,
        user: ticket.user,
      }).save();

      // cập nhật trạng thái => ghế trống
      await updateSeatStt({
        tripId: ticket.trip._id,
        seatNumber: ticket.seatNumber,
        status: SEAT_STATUS.EMPTY,
      });
      break;
    }

    case TICKET_STATUS.PAID: {
      await new Notification({
        ticket: ticket._id,
        type: NOTIFICATION_TYPE.TICKET_BOOK_SUCCESS,
        user: ticket.user,
      }).save();
      break;
    }

    default: {
    }
  }

  return ticket;
};

const TicketController = {
  // createTicket: async (req, res) => {
  //   try {
  //     const {
  //       customerPhone,
  //       customerName,
  //       note,
  //       trip,
  //       seatNumber,
  //       boardingPoint,
  //       dropOffPoint,
  //       status,
  //       discountCode,
  //     } = req.body;
  //     // Kiểm tra thông tin các trường bắt buộc
  //     if (!customerPhone || !customerName || !boardingPoint || !dropOffPoint) {
  //       return res.status(400).json({
  //         message: "Vui lòng nhập đầy đủ thông tin yêu cầu.",
  //       });
  //     }
  //     const user = req.user.id;
  //     const code = `MD${randomNumber(5)}`;

  //     // kiểm tra thông tin chuyến xe
  //     const tripInfo = await Trip.findById(trip).populate("bus route").exec();
  //     if (!tripInfo) {
  //       return res.status(404).json({
  //         message: "Chuyến xe không tồn tại",
  //       });
  //     }

  //     if (dayjs().isAfter(tripInfo.departureTime)) {
  //       return res.status(400).json({
  //         message: "Chuyến xe đã khởi hành",
  //       });
  //     }

  //     let totalAmount = tripInfo.price * seatNumber.length;

  //     // kiểm tra trạng thái ghế
  //     for await (let seat of seatNumber) {
  //       const seatInfo = await Seats.findOne({
  //         seatNumber: seat,
  //         trip: tripInfo._id,
  //       }).exec();

  //       if (!seatInfo) {
  //         return res.status(404).json({
  //           message: "Không tìm thấy ghế",
  //         });
  //       }

  //       if (seatInfo.status === SEAT_STATUS.SOLD) {
  //         return res.status(406).json({
  //           message: `Ghế ${seat} đã có người đặt`,
  //         });
  //       }
  //     }

  //     // cập nhật trạng thái ghế
  //     await updateSeatStt({
  //       tripId: tripInfo._id,
  //       seatNumber,
  //       status: SEAT_STATUS.SOLD,
  //     });

  //     let discount;
  //     if (discountCode) {
  //       discount = await Promotion.findOne({ code: discountCode }).exec();
  //       if (!discount) {
  //         return res.status(404).json({ message: "Mã giảm giá không tồn tại" });
  //       }

  //       if (discount.discountType === DISCOUNT_TYPE.AMOUNT) {
  //         totalAmount -= discount.discountAmount;
  //       } else {
  //         const decreasePrice = (totalAmount * discount.discountAmount) / 100;
  //         totalAmount -= decreasePrice;
  //       }

  //       totalAmount = totalAmount >= 0 ? totalAmount : 0;
  //     }

  //     const ticket = await new Tickets({
  //       user,
  //       customerPhone,
  //       customerName,
  //       note,
  //       trip,
  //       code,
  //       seatNumber,
  //       boardingPoint,
  //       dropOffPoint,
  //       status,
  //       totalAmount,
  //     }).save();

  //     // mã giảm giá
  //     if (discountCode) {
  //       await new PromotionUsage({
  //         user,
  //         ticket: ticket._id,
  //         promotion: discount._id,
  //       }).save();
  //     }
  //     // Đặt timeout 10 phút
  //     /* Nếu trong 10' không xử lý thanh toán thì vé sẽ bị hủy  */
  //     setTimeout(async () => {
  //       const ticketInfo = await Tickets.findById(ticket._id).exec();

  //       // Nếu người dùng chưa chọn phương thức thanh toán
  //       if (ticketInfo.paymentMethod === PAYMENT_METHOD.PENDING) {
  //         // Cập nhật trạng thái vé
  //         ticketInfo.status = TICKET_STATUS.CANCELED;
  //         await ticketInfo.save();
  //         // cập nhật trạng thái ghế
  //         await updateSeatStt({
  //           tripId: tripInfo._id,
  //           seatNumber,
  //           status: SEAT_STATUS.EMPTY,
  //         });
  //       }
  //     }, 10 * 60 * 1000); // 10 phút

  //     // Lấy thông tin chi tiết vé
  //     const ticketInfo = await Tickets.findById(ticket._id)
  //       .populate({
  //         path: "trip",
  //         populate: {
  //           path: "bus route",
  //         },
  //       })
  //       .exec();

  //     res.json({
  //       message: "Create ticket successfully",
  //       ticket: ticketInfo,
  //     });
  //   } catch (error) {
  //     res.status(500).json({
  //       message: "Lỗi tạo vé",
  //       error: error.message,
  //     });
  //   }
  // },
  /* update 02/12 nhưng chưa có phần hủy vé thì sẽ trả lại mã */
  createTicket: async (req, res) => {
    try {
      const {
        customerPhone,
        customerName,
        note,
        trip,
        seatNumber,
        boardingPoint,
        dropOffPoint,
        status,
        discountCode,
      } = req.body;

      // Kiểm tra thông tin các trường bắt buộc
      if (!customerPhone || !customerName || !boardingPoint || !dropOffPoint) {
        return res.status(400).json({
          message: "Vui lòng nhập đầy đủ thông tin yêu cầu.",
        });
      }

      const user = req.user.id;
      const code = `MD${randomNumber(5)}`;

      // kiểm tra thông tin chuyến xe
      const tripInfo = await Trip.findById(trip).populate("bus route").exec();
      if (!tripInfo) {
        return res.status(404).json({
          message: "Chuyến xe không tồn tại",
        });
      }

      if (dayjs().isAfter(tripInfo.departureTime)) {
        return res.status(400).json({
          message: "Chuyến xe đã khởi hành",
        });
      }

      let totalAmount = tripInfo.price * seatNumber.length;

      // kiểm tra trạng thái ghế
      for await (let seat of seatNumber) {
        const seatInfo = await Seats.findOne({
          seatNumber: seat,
          trip: tripInfo._id,
        }).exec();

        if (!seatInfo) {
          return res.status(404).json({
            message: "Không tìm thấy ghế",
          });
        }

        if (seatInfo.status === SEAT_STATUS.SOLD) {
          return res.status(406).json({
            message: `Ghế ${seat} đã có người đặt`,
          });
        }
      }

      // cập nhật trạng thái ghế
      await updateSeatStt({
        tripId: tripInfo._id,
        seatNumber,
        status: SEAT_STATUS.SOLD,
      });

      let discount;
      if (discountCode) {
        discount = await Promotion.findOne({ code: discountCode }).exec();
        if (!discount) {
          return res.status(404).json({ message: "Mã giảm giá không tồn tại" });
        }

        // Kiểm tra trạng thái mã giảm giá
        if (discount.status === PROMOTIONT_STATUS.EXPIRED) {
          return res.status(400).json({ message: "Mã giảm giá đã hết hạn" });
        }

        // Tính giảm giá
        if (discount.discountType === DISCOUNT_TYPE.AMOUNT) {
          totalAmount -= discount.discountAmount;
        } else {
          const decreasePrice = (totalAmount * discount.discountAmount) / 100;
          totalAmount -= decreasePrice;
        }

        totalAmount = totalAmount >= 0 ? totalAmount : 0;
      }

      const ticket = await new Tickets({
        user,
        customerPhone,
        customerName,
        note,
        trip,
        code,
        seatNumber,
        boardingPoint,
        dropOffPoint,
        status,
        totalAmount,
      }).save();

      // mã giảm giá
      if (discountCode) {
        await new PromotionUsage({
          user,
          ticket: ticket._id,
          promotion: discount._id,
        }).save();

        // Cập nhật remainingCount
        if (discount.remainingCount > 0) {
          discount.remainingCount -= 1;
          await discount.save();
        } else {
          return res
            .status(400)
            .json({ message: "Mã giảm giá đã hết lượt sử dụng" });
        }
      }

      // Đặt timeout 10 phút
      /* Nếu trong 10' không xử lý thanh toán thì vé sẽ bị hủy  */
      setTimeout(async () => {
        const ticketInfo = await Tickets.findById(ticket._id).exec();

        // Nếu người dùng chưa chọn phương thức thanh toán
        if (ticketInfo.paymentMethod === PAYMENT_METHOD.PENDING) {
          // Cập nhật trạng thái vé
          ticketInfo.status = TICKET_STATUS.CANCELED;
          await ticketInfo.save();

          // cập nhật trạng thái ghế
          await updateSeatStt({
            tripId: tripInfo._id,
            seatNumber,
            status: SEAT_STATUS.EMPTY,
          });
          if (discountCode) {
            const discount = await Promotion.findOne({
              code: discountCode,
            }).exec();
            if (discount) {
              discount.remainingCount += 1;
              await discount.save();
            }
          }
        }
      }, 1 * 60 * 1000); // 10 phút

      // Lấy thông tin chi tiết vé
      const ticketInfo = await Tickets.findById(ticket._id)
        .populate({
          path: "trip",
          populate: {
            path: "bus route",
          },
        })
        .exec();

      res.json({
        message: "Create ticket successfully",
        ticket: ticketInfo,
      });
    } catch (error) {
      res.status(500).json({
        message: "Lỗi tạo vé",
        error: error.message,
      });
    }
  },
  /* getTickets: async (req, res) => {
    try {
      const { page = PAGINATION.PAGE, limit = PAGINATION.LIMIT } = req.query;

      const { tickets, currentPage, totalPage } = await getListTicket(
        page,
        limit
      );

      res.json({
        data: tickets,
        totalPage,
        currentPage,
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }, */
  getTickets: async (req, res) => {
    try {
      const { page = PAGINATION.PAGE, limit = PAGINATION.LIMIT } = req.query;

      // Lấy danh sách vé, trang hiện tại và tổng số trang từ getListTicket
      const { tickets, currentPage, totalPage } = await getListTicket(
        page,
        limit
      );

      // Truy vấn thêm thông tin từ bảng BusRoutes dựa trên route_id của từng vé
      const ticketsWithRoute = await Promise.all(
        tickets.map(async (ticket) => {
          // Lấy thông tin chuyến đi từ bảng Trip, giả sử mỗi vé có trip_id
          const trip = await Trip.findById(ticket.trip);

          // Kiểm tra xem trip có chứa route_id không
          if (trip && trip.route) {
            // Truy vấn bảng BusRoutes để lấy thông tin về tuyến xe từ route_id
            const busRoute = await BusRoutes.findById(trip.route);
            return {
              ...ticket.toObject(), // Bao gồm tất cả các dữ liệu từ ticket
              busRoute: busRoute || null, // Thêm dữ liệu về tuyến xe vào mỗi vé
            };
          }
          return ticket;
        })
      );

      // Trả về kết quả với dữ liệu về tuyến xe (busRoute) đã được thêm vào
      res.json({
        data: ticketsWithRoute,
        totalPage,
        currentPage,
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },
  getMyTickets: async (req, res) => {
    try {
      const { page = PAGINATION.PAGE, limit = PAGINATION.LIMIT } = req.query;

      const queryObj = {
        user: req.user.id,
      };

      const { tickets, currentPage, totalPage } = await getListTicket(
        page,
        limit,
        queryObj
      );

      res.json({
        data: tickets,
        totalPage,
        currentPage,
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  getTicket: async (req, res) => {
    try {
      const { id } = req.params;

      // Tìm vé theo id và populate thông tin người dùng và chuyến xe
      const ticket = await Tickets.findById(id)
        .populate(["user", "trip"]) // Đảm bảo lấy thông tin chuyến xe
        .exec();

      if (!ticket) {
        return res.status(404).json({
          message: "Ticket not found",
        });
      }

      // Lấy thông tin khuyến mãi nếu có
      let promotion = null;
      const promotionUsage = await PromotionUsage.findOne({
        ticket: ticket._id,
      }).exec();
      if (promotionUsage) {
        promotion = await Promotion.findById(promotionUsage.promotion).exec();
      }

      // Lấy thông tin về chuyến xe từ bảng Trip
      const trip = ticket.trip; // Chúng ta đã populate trip trong ticket
      if (!trip) {
        return res.status(404).json({
          message: "Trip not found for this ticket",
        });
      }

      // Nếu route là một tham chiếu tới bảng BusRoutes, ta populate thêm thông tin tuyến xe
      let route = trip.route; // Lấy thông tin tuyến từ trip
      if (typeof route === "object" && route._id) {
        // Populate thông tin từ bảng BusRoutes
        route = await BusRoutes.findById(route._id).exec();
      }

      // Lấy thông tin về xe từ bảng Bus
      const bus = await Bus.findById(trip.bus).exec();
      if (!bus) {
        return res.status(404).json({
          message: "Bus not found for this trip",
        });
      }

      // Trả về thông tin vé, chuyến xe, xe và người lái xe
      res.json({
        ...ticket.toJSON(),
        trip: {
          id: trip._id,
          route: route
            ? {
                startProvince: route.startProvince,
                startDistrict: route.startDistrict,
                endProvince: route.endProvince,
                endDistrict: route.endDistrict,
                duration: route.duration,
                status: route.status,
                distance: route.distance,
                pricePerKM: route.pricePerKM,
              }
            : trip.route, // Trả về toàn bộ thông tin của tuyến nếu có
          departureTime: trip.departureTime, // Thời gian khởi hành
          arrivalTime: trip.arrivalTime, // Thời gian đến
          price: trip.price, // Giá vé của chuyến xe
        },
        bus: {
          id: bus._id,
          busType: bus.busType, // Loại xe
          licensePlate: bus.licensePlate, // Biển số xe
          driver: bus.driver, // Thông tin người lái xe
        },
        promotion,
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  updateTicketPaymentMethod: async (req, res) => {
    try {
      const { id } = req.params; // ID của vé
      const { paymentMethod } = req.body; // Phương thức thanh toán do người dùng nhập

      // Kiểm tra paymentMethod có hợp lệ không
      if (
        ![PAYMENT_METHOD.ZALOPAY, PAYMENT_METHOD.OFFLINEPAYMENT].includes(
          paymentMethod
        )
      ) {
        return res.status(400).json({
          message:
            "Phương thức thanh toán không hợp lệ. Chỉ chấp nhận 'ZALOPAY' hoặc 'OFFLINEPAYMENT'.",
        });
      }

      // Truy xuất vé dựa vào id
      const ticketInfo = await Tickets.findById(id).exec();

      // Kiểm tra vé có tồn tại không
      if (!ticketInfo) {
        return res.status(404).json({
          message: "Không tìm thấy vé với ID đã cung cấp.",
        });
      }

      // Cập nhật paymentMethod trong vé
      ticketInfo.paymentMethod = paymentMethod;

      // Nếu người dùng chọn ZALOPAY, thực hiện tạo liên kết thanh toán
      if (paymentMethod === PAYMENT_METHOD.ZALOPAY) {
        // Lấy thông tin đơn hàng từ vé
        const orderInfo = `BOOKING_${ticketInfo._id}`;
        // Tạo token thanh toán từ ZaloPay
        const zpUrl = await createPaymentToken(
          orderInfo,
          ticketInfo.totalAmount
        );
        // Cập nhật trạng thái vé là đã xác nhận thanh toán và trả về thông tin ZaloPay
        ticketInfo.invoiceCode = zpUrl.appTransId;
        await ticketInfo.save(); // Lưu thay đổi vào database
        // Trả về thông tin ZaloPay trả về, bao gồm appTransId
        return res.json(zpUrl);
      } else {
        ticketInfo.status = TICKET_STATUS.PAYMENTPENDING; // Đánh dấu là chờ thanh toán với PAYMENTPENDING
        await ticketInfo.save(); // Lưu thay đổi vào database
      }

      res.json({
        message: "Cập nhật phương thức thanh toán thành công.",
        ticketInfo,
      });
    } catch (error) {
      res.status(500).json({
        message:
          "Đã xảy ra lỗi trong quá trình cập nhật phương thức thanh toán.",
        error: error.message,
      });
    }
  },

  updateTicketStatus: async (req, res) => {
    try {
      const user = req.user;
      const { id } = req.params;
      const { status } = req.body;

      const ticketInfo = await Tickets.findById(id).exec();
      const tripInfo = await Trip.findById(ticketInfo.trip).exec();

      const userRole = await Permission.findOne({ user: user.id }).exec();

      const isGTE5h =
        Math.floor(
          (dayjs(tripInfo.departureTime).diff(dayjs()) / (1000 * 60 * 60)) % 24
        ) >= 5;

      if (
        userRole === ROLE.CUSTOMER &&
        status === TICKET_STATUS.CANCELED &&
        !isGTE5h
      ) {
        return res.status(400).json({
          message: "Bạn chỉ có thể huỷ vé trước khi chuyến xe xuất phát 5h",
        });
      }

      const ticket = await ticketUpdateStt({ ticketId: id, status });

      res.json(ticket);
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  createPaymentUrl: async (req, res) => {
    try {
      const { ticketId } = req.body;

      const ticket = await Tickets.findById(ticketId).exec();
      if (!ticket) {
        return res.status(404).json({ message: "Không tìm thấy vé" });
      }

      const ipAddr =
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

      const orderId = `BOOKING_${ticket._id}`;
      const paymentUrl = await createVNPayPaymentUrl({
        ipAddr,
        orderId,
        amount: ticket.totalAmount,
        orderInfo: `Thanh toan ve xe ${orderId}`,
      });

      res.json(paymentUrl);
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  /*  createzalopaypaymentUrl: async (req, res) => {
    try {
      // Lấy ticketId từ body request
      const { ticketId } = req.body;

      // Tìm vé trong cơ sở dữ liệu
      const ticket = await Tickets.findById(ticketId).exec();
      if (!ticket) {
        return res.status(404).json({ message: "Không tìm thấy vé" });
      }
      // Lấy thông tin đơn hàng từ vé
      const orderInfo = `BOOKING_${ticket._id}`;
      // Tạo token thanh toán từ ZaloPay
      const zpUrl = await createPaymentToken(orderInfo, ticket.totalAmount);
      // Trả về phản hồi đầy đủ trong body
      res.json(zpUrl); // Trả về thông tin ZaloPay trả về, bao gồm appTransId
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }, */

  /* callbackPay: async (req, res) => {
    let result = {};

    try {
      let dataStr = req.body.data;
      let reqMac = req.body.mac;

      let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
      console.log("mac =", mac);

      // kiểm tra callback hợp lệ (đến từ ZaloPay server)
      if (reqMac !== mac) {
        // callback không hợp lệ
        result.return_code = -1;
        result.return_message = "mac not equal";
      } else {
        // thanh toán thành công
        // merchant cập nhật trạng thái cho đơn hàng
        let dataJson = JSON.parse(dataStr, config.key2);
        console.log(
          "update order's status = success where app_trans_id =",
          dataJson["app_trans_id"]
        );
        result.return_code = 1;
        result.return_message = "success";
      }
    } catch (ex) {
      result.return_code = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
      result.return_message = ex.message;
    }

    // thông báo kết quả cho ZaloPay server
    res.json(result);
    const data = req.query;
    console.log("Dữ liệu từ query string:", data);
  }, */

  callbackPay: async (req, res) => {
    // update 27/11
    let result = {};

    try {
      // Lấy dữ liệu từ callback
      let dataStr = req.body.data;
      let reqMac = req.body.mac;

      // Tính lại MAC để kiểm tra tính hợp lệ
      let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
      console.log("mac =", mac);

      // Kiểm tra callback có hợp lệ hay không
      if (reqMac !== mac) {
        // Callback không hợp lệ
        result.return_code = -1;
        result.return_message = "mac not equal";
      } else {
        // Parse dữ liệu callback
        let dataJson = JSON.parse(dataStr);

        // Lấy app_trans_id từ callback
        const appTransId = dataJson["app_trans_id"];
        console.log("app_trans_id =", appTransId);

        // Tìm vé dựa trên app_trans_id
        const ticketInfo = await Tickets.findOne({
          invoiceCode: appTransId,
        }).exec();

        if (!ticketInfo) {
          // Không tìm thấy vé, trả về lỗi
          console.log("Ticket not found for app_trans_id =", appTransId);
          result.return_code = 0;
          result.return_message = "Ticket not found";
        } else {
          // Cập nhật trạng thái vé
          ticketInfo.status = TICKET_STATUS.PAID;
          await ticketInfo.save();

          console.log(
            "Updated ticket status to PAID for app_trans_id =",
            appTransId
          );

          // Trả về thành công
          result.return_code = 1;
          result.return_message = "success";
        }
      }
    } catch (ex) {
      // Bắt lỗi và trả về
      console.error("Error processing callback:", ex.message);
      result.return_code = 0; // ZaloPay sẽ retry callback
      result.return_message = ex.message;
    }

    // Trả kết quả cho ZaloPay server
    res.json(result);

    // Log query string để theo dõi
    const data = req.query;
    console.log("Dữ liệu từ query string:", data);
  },

  oderStatusPay: async (req, res) => {
    const app_trans_id = req.params.app_trans_id;
    let postData = {
      app_id: config.app_id,
      app_trans_id: app_trans_id, // Input your app_trans_id
    };

    let data =
      postData.app_id + "|" + postData.app_trans_id + "|" + config.key1; // appid|app_trans_id|key1
    postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    let postConfig = {
      method: "post",
      url: "https://sb-openapi.zalopay.vn/v2/query",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: qs.stringify(postData),
    };
    try {
      const result = await axios(postConfig);
      console.log("Response received:", result.data); // Log the response data
      res.json(result.data);
    } catch (error) {
      console.error("Error occurred:", error.message); // Log the error if it occurs
      res.status(500).json({ error: error.message });
    }
  },
};

export default TicketController;
