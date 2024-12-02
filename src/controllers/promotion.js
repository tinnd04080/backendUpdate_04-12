import dayjs from "dayjs";
import { PAGINATION } from "../constants/index.js";
import Promotion from "../models/promotion.js";
import { PROMOTIONT_STATUS } from "../constants/index.js";

const PromotionController = {
  /*  createPromotion: async (req, res) => {
    try {
      const {
        code,
        description,
        discountAmount,
        discountType,
        startDate,
        endDate,
      } = req.body;

      const busType = await new Promotion({
        code,
        description,
        discountAmount,
        discountType,
        startDate,
        endDate,
      }).save();

      res.json(busType);
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }, */
  /* Tạo mã giảm giá update 02/12 */
  /* createPromotion: async (req, res) => {
    try {
      const {
        code,
        description,
        discountAmount,
        discountType,
        startDate,
        endDate,
        quantity, // Thêm trường quantity
        status, // Thêm trường status
      } = req.body;

      // Kiểm tra xem trạng thái có được chọn không
      if (!status || !Object.values(PROMOTIONT_STATUS).includes(status)) {
        return res.status(400).json({
          message:
            "Trạng thái không hợp lệ, vui lòng chọn ACTIVE hoặc EXPIRED.",
        });
      }

      // Kiểm tra số lượng hợp lệ
      if (quantity <= 0) {
        return res.status(400).json({ message: "Số lượng phải lớn hơn 0" });
      }

      // Tạo và lưu mã giảm giá, gán số lượng vào remainingCount
      const promotion = await new Promotion({
        code,
        description,
        discountAmount,
        discountType,
        startDate,
        endDate,
        quantity,
        remainingCount: quantity, // Gán số lượng vào remainingCount
        status,
      }).save();

      res.json(promotion);
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }, */
  /* Tạo mã giảm giá update 02/12 finish */
  createPromotion: async (req, res) => {
    try {
      const {
        code,
        description,
        discountAmount,
        discountType,
        startDate,
        endDate,
        quantity, // Thêm trường quantity
        status, // Thêm trường status
      } = req.body;

      // Kiểm tra số lượng hợp lệ
      if (quantity <= 0) {
        return res.status(400).json({ message: "Số lượng phải lớn hơn 0" });
      }

      // Kiểm tra ngày bắt đầu hợp lệ
      const currentDate = new Date(); // Lấy ngày giờ hiện tại
      const startDateObj = new Date(startDate);

      // Nếu startDate là ngày trong tương lai, tự động đặt status thành "EXPIRED"
      let finalStatus = status;
      if (startDateObj > currentDate) {
        finalStatus = "EXPIRED";
      } else {
        // Kiểm tra trạng thái hợp lệ chỉ khi startDate không phải tương lai
        if (!status || !Object.values(PROMOTIONT_STATUS).includes(status)) {
          return res.status(400).json({
            message:
              "Trạng thái không hợp lệ, vui lòng chọn ACTIVE hoặc EXPIRED.",
          });
        }
      }

      // Tạo và lưu mã giảm giá, gán số lượng vào remainingCount
      const promotion = await new Promotion({
        code,
        description,
        discountAmount,
        discountType,
        startDate,
        endDate,
        quantity,
        remainingCount: quantity, // Gán số lượng vào remainingCount
        status: finalStatus,
      }).save();

      res.json(promotion);
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },
  /*  getPromotions: async (req, res) => {
    try {
      const { page = PAGINATION.PAGE, limit = PAGINATION.LIMIT } = req.query;

      const promotions = await Promotion.find()
        .sort("-createdAt")
        .skip((page - 1) * limit)
        .limit(limit * 1)
        .exec();

      const count = await Promotion.countDocuments();

      const totalPage = Math.ceil(count / limit);
      const currentPage = Number(page);

      res.json({
        data: promotions,
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
  /* update lấy danh sách
Mô tả luồng xử lý: Trước khi trả về danh sách khuyến mãi, kiểm tra 2 điều kiện và cập nhật trạng thái. 
Điều kiện 1: Trường endDate có bằng ngày hiện tại hay không Nếu endDate là ngày quá khứ. Thì trường status sẽ được chuyển thành EXPIRED
Điều kiện 2: Kiểm tra trường remainingCount. Nếu remainingCount <= 0. Thì trường status sẽ được chuyển thành EXPIRED vì đã hết lượt
Còn nếu qua 2 điều kiện thì giữ nguyên*/
  getPromotions: async (req, res) => {
    try {
      const { page = PAGINATION.PAGE, limit = PAGINATION.LIMIT } = req.query;

      const promotions = await Promotion.find()
        .sort("-createdAt")
        .skip((page - 1) * limit)
        .limit(limit * 1)
        .exec();

      const currentDate = new Date();

      // Kiểm tra và cập nhật trạng thái trước khi trả về
      const updatedPromotions = await Promise.all(
        promotions.map(async (promotion) => {
          let status = promotion.status;

          if (
            promotion.remainingCount <= 0 ||
            new Date(promotion.endDate) < currentDate
          ) {
            status = PROMOTIONT_STATUS.EXPIRED;
          }

          // Nếu trạng thái cần cập nhật
          if (status !== promotion.status) {
            promotion.status = status;
            await promotion.save(); // Lưu lại thay đổi vào DB
          }

          return promotion;
        })
      );

      const count = await Promotion.countDocuments();
      const totalPage = Math.ceil(count / limit);
      const currentPage = Number(page);

      res.json({
        data: updatedPromotions,
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

  getPromotion: async (req, res) => {
    try {
      const { id } = req.params;

      const promotion = await Promotion.findById(id).exec();

      res.json(promotion);
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  /*   updatePromotion: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        code,
        description,
        discountAmount,
        discountType,
        startDate,
        endDate,
      } = req.body;

      const promotion = await Promotion.findByIdAndUpdate(
        id,
        {
          code,
          description,
          discountAmount,
          discountType,
          startDate,
          endDate,
        },
        { new: true }
      ).exec();

      res.json(promotion);
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }, */

  /*  updatePromotion: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        code,
        description,
        discountAmount,
        discountType,
        startDate,
        endDate,
        remainingCount, // Thêm trường remainingCount
        status, // Thêm trường status
      } = req.body;

      const currentDate = new Date(); // Lấy ngày hiện tại
      const startDateObj = new Date(startDate); // Chuyển startDate thành đối tượng Date

      // Kiểm tra nếu startDate là trong tương lai thì tự động đặt status thành "EXPIRED"
      let finalStatus = status;
      if (startDateObj > currentDate) {
        finalStatus = "EXPIRED";
      } else {
        // Kiểm tra xem status có hợp lệ không, chỉ khi startDate không phải trong tương lai
        if (!status || !Object.values(PROMOTIONT_STATUS).includes(status)) {
          return res.status(400).json({
            message:
              "Trạng thái không hợp lệ, vui lòng chọn ACTIVE hoặc EXPIRED.",
          });
        }
      }

      // Cập nhật Promotion
      const promotion = await Promotion.findByIdAndUpdate(
        id,
        {
          code,
          description,
          discountAmount,
          discountType,
          startDate,
          endDate,
          remainingCount, // Cập nhật remainingCount
          status: finalStatus, // Cập nhật status sau khi kiểm tra điều kiện
        },
        { new: true } // Trả về đối tượng mới sau khi cập nhật
      ).exec();

      // Trả về thông tin đã cập nhật
      res.json(promotion);
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }, */
  updatePromotion: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        code,
        description,
        discountAmount,
        discountType,
        startDate,
        endDate,
        remainingCount, // Thêm trường remainingCount
        status, // Thêm trường status
        quantity, // Thêm trường quantity
      } = req.body;

      const currentDate = new Date(); // Lấy ngày hiện tại
      const startDateObj = new Date(startDate); // Chuyển startDate thành đối tượng Date

      // Kiểm tra nếu startDate là trong tương lai thì tự động đặt status thành "EXPIRED"
      let finalStatus = status;
      if (startDateObj > currentDate) {
        finalStatus = "EXPIRED";
      } else {
        // Kiểm tra xem status có hợp lệ không, chỉ khi startDate không phải trong tương lai
        if (!status || !Object.values(PROMOTIONT_STATUS).includes(status)) {
          return res.status(400).json({
            message:
              "Trạng thái không hợp lệ, vui lòng chọn ACTIVE hoặc EXPIRED.",
          });
        }
      }

      // Lấy thông tin Promotion hiện tại từ cơ sở dữ liệu
      const promotion = await Promotion.findById(id).exec();

      if (!promotion) {
        return res.status(404).json({ message: "Promotion not found" });
      }

      // Kiểm tra nếu quantity thay đổi, tính toán lại remainingCount
      let updatedRemainingCount = remainingCount;

      // Nếu quantity thay đổi
      if (quantity !== undefined && quantity !== promotion.quantity) {
        // Tính toán lại remainingCount mới theo công thức:
        // remainingCount mới = quantity mới - (quantity cũ - remainingCount cũ)
        updatedRemainingCount =
          quantity - (promotion.quantity - promotion.remainingCount);
      }

      // Cập nhật Promotion
      const updatedPromotion = await Promotion.findByIdAndUpdate(
        id,
        {
          code,
          description,
          discountAmount,
          discountType,
          startDate,
          endDate,
          remainingCount: updatedRemainingCount, // Cập nhật lại remainingCount
          quantity, // Cập nhật quantity
          status: finalStatus, // Cập nhật status
        },
        { new: true } // Trả về đối tượng mới sau khi cập nhật
      ).exec();

      // Trả về thông tin đã cập nhật
      res.json(updatedPromotion);
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },
  removePromotion: async (req, res) => {
    try {
      const { id } = req.params;

      const promotion = await Promotion.findByIdAndDelete(id).exec();

      res.json(promotion);
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  applyPromotion: async (req, res) => {
    try {
      const { code } = req.params;

      const discount = await Promotion.findOne({ code }).exec();
      if (!discount) {
        return res.status(404).json({ message: "Không tìm thấy mã giảm giá" });
      }

      const isBeforeStart = dayjs().isBefore(dayjs(discount.startDate));
      if (isBeforeStart) {
        return res.status(406).json({ message: "Chưa đến thời gian sử dụng" });
      }

      const isExpired = dayjs().isAfter(discount.endDate);
      if (isExpired) {
        return res.status(406).json({ message: "Mã giảm giá đã hết hạn" });
      }

      res.json(discount);
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },
  getPromotionByCode: async (req, res) => {
    try {
      const { code } = req.params;

      // Tìm kiếm theo mã giảm giá 'code', không phải theo _id
      const promotion = await Promotion.findOne({ code }).exec();

      if (!promotion) {
        return res.status(404).json({ message: "Không tìm thấy mã giảm giá" });
      }

      res.json(promotion);
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },
};

export default PromotionController;
