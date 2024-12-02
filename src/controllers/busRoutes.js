import dayjs from "dayjs";
import { PAGINATION } from "../constants/index.js";
import BusRoutes from "../models/busRoutes.js";

const BusRouteController = {
  createBusRoutes: async (req, res) => {
    try {
      const {
        startProvince,
        startDistrict,
        endDistrict,
        endProvince,
        duration,
        status,
        distance,
        pricePerKM,
      } = req.body;

      const busRoute = await new BusRoutes({
        startProvince,
        startDistrict,
        endDistrict,
        endProvince,
        duration,
        status,
        distance,
        pricePerKM,
      }).save();

      res.json(busRoute);
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  getBusRoutes: async (req, res) => {
    try {
      const {
        page = PAGINATION.PAGE,
        limit = PAGINATION.LIMIT,
        startProvince,
        startDistrict,
        endProvince,
        endDistrict,
        status,
        duration,
      } = req.query;

      const queryObj = {};

      startProvince && (queryObj.startProvince = startProvince);
      startDistrict && (queryObj.startDistrict = startDistrict);
      endProvince && (queryObj.endProvince = endProvince);
      endDistrict && (queryObj.endDistrict = endDistrict);
      status && (queryObj.status = status);
      if (duration) {
        queryObj.duration = {
          $gte: dayjs(duration).startOf("day").toDate(),
          $lte: dayjs(duration).endOf("day").toDate(),
        };
      }

      const busRoutes = await BusRoutes.find(queryObj)
        .sort("-createdAt")
        .skip((page - 1) * limit)
        .limit(limit * 1)
        .exec();

      const count = await BusRoutes.countDocuments();

      const totalPage = Math.ceil(count / limit);
      const currentPage = Number(page);

      res.json({
        data: busRoutes,
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

  getBusRoute: async (req, res) => {
    try {
      const { id } = req.params;

      const busRoute = await BusRoutes.findById(id);

      res.json(busRoute);
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  updateBusRoute: async (req, res) => {
    try {
      const { id } = req.params;
      console.log(req.body);
      const {
        startProvince,
        startDistrict,
        endDistrict,
        endProvince,
        duration,
        status,
        distance,
        pricePerKM,
      } = req.body;

      const busRoute = await BusRoutes.findByIdAndUpdate(
        id,
        {
          startProvince,
          startDistrict,
          endDistrict,
          endProvince,
          duration,
          status,
          distance,
          pricePerKM,
        },
        { new: true }
      );

      res.json(busRoute);
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },
  /* update 1/12 */
  /*   updateBusRoute: async (req, res) => {
    try {
      const { id } = req.params; // Lấy id tuyến xe từ tham số URL
      console.log(req.body); // In ra dữ liệu body để kiểm tra

      const {
        startProvince,
        startDistrict,
        endDistrict,
        endProvince,
        duration,
        status, // Trạng thái của tuyến xe (status)
        distance,
        pricePerKM,
      } = req.body;

      // Kiểm tra xem tuyến xe này có đang tham gia chuyến xe nào không
      const tripUsingBusRoute = await Trip.findOne({ busRouteId: id }); // Giả sử busRouteId là ID của tuyến xe trong bảng Trip

      // Nếu tuyến xe đang tham gia chuyến xe và chuyến xe có status là OPEN
      if (
        tripUsingBusRoute &&
        tripUsingBusRoute.status === "OPEN" &&
        status !== tripUsingBusRoute.status
      ) {
        return res.status(400).json({
          message:
            "Không thể thay đổi trạng thái của tuyến xe khi chuyến xe đang ở trạng thái OPEN",
        });
      }

      // Cập nhật thông tin tuyến xe
      const busRoute = await BusRoutes.findByIdAndUpdate(
        id,
        {
          startProvince,
          startDistrict,
          endDistrict,
          endProvince,
          duration,
          status, // Cập nhật trạng thái của tuyến xe
          distance,
          pricePerKM,
        },
        { new: true }
      );

      // Trả về thông tin tuyến xe đã được cập nhật
      res.json(busRoute);
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }, */
  removeBusRoute: async (req, res) => {
    try {
      const { id } = req.params;

      const busRoute = await BusRoutes.findByIdAndDelete(id);

      res.json(busRoute);
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },
};

export default BusRouteController;
