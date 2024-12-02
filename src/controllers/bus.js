import { PAGINATION } from "../constants/index.js";
import Bus from "../models/bus.js";
import trip from "../models/trips.js";

const BusController = {
  // Hàm tạo mới một bus
  /*  createBus: async (req, res) => {
    try {
      // Lấy thông tin từ body request
      const { busTypeName, seatCapacity, priceFactor, licensePlate } = req.body;

      // Kiểm tra nếu biển số đã tồn tại
      const existingBus = await Bus.findOne({ licensePlate });
      if (existingBus) {
        return res.status(400).json({ message: "Biển số xe đã tồn tại" });
      }

      // Tạo mới một xe bus
      const bus = await new Bus({
        busTypeName,
        seatCapacity,
        priceFactor,
        licensePlate,
      }).save();

      res.json(bus);
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }, */

  /* Hàm tạo xe. Cập nhật ngày 01/12 */
  createBus: async (req, res) => {
    try {
      // Lấy thông tin từ body request
      const { busTypeName, seatCapacity, priceFactor, licensePlate, status } =
        req.body;

      // Kiểm tra nếu biển số đã tồn tại
      const existingBus = await Bus.findOne({ licensePlate });
      if (existingBus) {
        return res.status(400).json({ message: "Biển số xe đã tồn tại" });
      }

      // Tạo mới một xe bus với trường status, nếu không có thì mặc định là OPEN
      const bus = await new Bus({
        busTypeName,
        seatCapacity,
        priceFactor,
        licensePlate,
        status: status || BUSES_STATUS.OPEN, // Nếu không có status, sử dụng mặc định là OPEN
      }).save();

      res.json(bus);
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Hàm lấy danh sách các bus với phân trang
  getBuses: async (req, res) => {
    try {
      const { page = PAGINATION.PAGE, limit = PAGINATION.LIMIT } = req.query;

      // Lấy danh sách xe bus với phân trang
      const buses = await Bus.find()
        .sort("-createdAt")
        .skip((page - 1) * limit)
        .limit(limit * 1)
        .exec();

      const count = await Bus.countDocuments();
      const totalPage = Math.ceil(count / limit);
      const currentPage = Number(page);

      res.json({
        data: buses,
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

  // Hàm lấy thông tin chi tiết một bus theo id
  getBus: async (req, res) => {
    try {
      const { id } = req.params;

      const bus = await Bus.findById(id).exec();

      if (!bus) {
        return res.status(404).json({ message: "Bus not found" });
      }

      res.json(bus);
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Hàm cập nhật thông tin một bus
  /*   updateBus: async (req, res) => {
    try {
      const { id } = req.params;
      const { busTypeName, seatCapacity, priceFactor, licensePlate } = req.body;

      // Cập nhật thông tin xe bus
      const bus = await Bus.findByIdAndUpdate(
        id,
        {
          busTypeName,
          seatCapacity,
          priceFactor,
          licensePlate,
        },
        { new: true }
      ).exec();

      if (!bus) {
        return res.status(404).json({ message: "Bus not found" });
      }

      res.json(bus);
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }, */
  /* Hàm chỉnh sửa xe. Cập nhật 12/01 */
  /*  updateBus: async (req, res) => {
    try {
      const { id } = req.params;
      const { busTypeName, seatCapacity, priceFactor, licensePlate, status } =
        req.body;

      // Cập nhật thông tin xe bus, bao gồm trường status nếu có
      const bus = await Bus.findByIdAndUpdate(
        id,
        {
          busTypeName,
          seatCapacity,
          priceFactor,
          licensePlate,
          status, // Cập nhật trường status
        },
        { new: true }
      ).exec();

      // Kiểm tra nếu không tìm thấy bus
      if (!bus) {
        return res.status(404).json({ message: "Bus not found" });
      }

      // Trả về thông tin bus đã cập nhật
      res.json(bus);
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }, */

  updateBus: async (req, res) => {
    try {
      const { id } = req.params;
      const { busTypeName, seatCapacity, priceFactor, licensePlate, status } =
        req.body;

      /*   // Kiểm tra xem xe bus này có đang tham gia chuyến xe nào không
      const tripUsingBus = await Trip.findOne({ busId: id });

      // Nếu xe đang tham gia chuyến xe và chuyến xe có status là OPEN
      if (tripUsingBus && tripUsingBus.status === "OPEN") {
        return res.status(400).json({
          message:
            "Xe không thể thay đổi trạng thái khi đang tham gia chuyến xe mở",
        });
      } */

      // Cập nhật thông tin xe bus, bao gồm trường status nếu có
      const bus = await Bus.findByIdAndUpdate(
        id,
        {
          busTypeName,
          seatCapacity,
          priceFactor,
          licensePlate,
          status, // Cập nhật trường status
        },
        { new: true }
      ).exec();

      // Kiểm tra nếu không tìm thấy bus
      if (!bus) {
        return res.status(404).json({ message: "Bus not found" });
      }

      // Trả về thông tin bus đã cập nhật
      res.json(bus);
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Hàm xóa một bus theo id
  removeBus: async (req, res) => {
    try {
      const { id } = req.params;

      const bus = await Bus.findByIdAndDelete(id).exec();

      if (!bus) {
        return res.status(404).json({ message: "Bus not found" });
      }

      res.json({ message: "Bus removed successfully" });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },
};

export default BusController;
