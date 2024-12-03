import { PAGINATION } from "../constants/index.js";
import Bus from "../models/bus.js";
import Trip from "../models/trips.js";
import BusRoutes from "../models/busRoutes.js";
import Seats from "../models/seats.js";
import { SEAT_STATUS } from "../constants/index.js";
import { TRIP_STATUS } from "../constants/index.js";
import moment from "moment";
const TripController = {
  /* Thêm chuyến xe mới */
  /* createTrip: async (req, res) => {
    try {
      const { route, bus, departureTime, arrivalTime, status } = req.body;

      // Lấy thông tin xe và tuyến xe
      const busInfo = await Bus.findById(bus).exec();
      const busRouteInfo = await BusRoutes.findById(route).exec();

      // Tính toán giá vé
      const ticketPrice =
        busRouteInfo.distance * busRouteInfo.pricePerKM * busInfo.priceFactor;

      if (!busInfo || !busRouteInfo) {
        return res.status(404).json({
          message: "Bus or route not found",
        });
      }

      // Tạo chuyến xe
      const trip = await new Trip({
        route,
        bus,
        price: ticketPrice,
        availableSeats: busInfo.seatCapacity || 0,
        departureTime,
        arrivalTime,
        status,
      }).save();

      // Lấy số ghế từ seatCapacity
      const seatCapacity = busInfo.seatCapacity;

      // Danh sách để lưu ghế
      const seats = [];
      if (seatCapacity <= 16) {
        // Tạo ghế từ A01 đến A<seatCapacity>
        for (let i = 1; i <= seatCapacity; i++) {
          const seatNumber = `A${i.toString().padStart(2, "0")}`;
          seats.push({ trip: trip._id, seatNumber, status: SEAT_STATUS.EMPTY });
        }
      } else {
        // Chia ghế thành hai nhóm A và B
        const halfCapacity = Math.ceil(seatCapacity / 2);

        // Tạo nhóm A
        for (let i = 1; i <= halfCapacity; i++) {
          const seatNumber = `A${i.toString().padStart(2, "0")}`;
          seats.push({ trip: trip._id, seatNumber, status: SEAT_STATUS.EMPTY });
        }

        // Tạo nhóm B
        for (let i = 1; i <= seatCapacity - halfCapacity; i++) {
          const seatNumber = `B${i.toString().padStart(2, "0")}`;
          seats.push({ trip: trip._id, seatNumber, status: SEAT_STATUS.EMPTY });
        }
      }

      // Lưu danh sách ghế vào cơ sở dữ liệu
      await Seats.insertMany(seats);

      res.json({
        message: "Trip created successfully",
        trip,
        seats,
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }, */
  createTrip: async (req, res) => {
    try {
      const { route, bus, departureTime, arrivalTime, status } = req.body;

      // Lấy thông tin xe và tuyến xe
      const busInfo = await Bus.findById(bus).exec();
      const busRouteInfo = await BusRoutes.findById(route).exec();

      // Kiểm tra trạng thái của xe và tuyến xe
      if (busInfo.status !== "OPEN") {
        return res.status(400).json({
          message: "Không thể thêm. Vì xe này hiện tại không hoạt động",
        });
      }

      if (busRouteInfo.status !== "OPEN") {
        return res.status(400).json({
          message: "Không thể thêm. Vì tuyến đường hiện tại không hoạt động",
        });
      }

      // Tính toán giá vé
      const ticketPrice =
        busRouteInfo.distance * busRouteInfo.pricePerKM * busInfo.priceFactor;

      if (!busInfo || !busRouteInfo) {
        return res.status(404).json({
          message: "Không tìm thấy xe hoặc tuyến đường",
        });
      }

      // Tạo chuyến xe
      const trip = await new Trip({
        route,
        bus,
        price: ticketPrice,
        availableSeats: busInfo.seatCapacity || 0,
        departureTime,
        arrivalTime,
        status,
      }).save();

      // Lấy số ghế từ seatCapacity
      const seatCapacity = busInfo.seatCapacity;

      // Danh sách để lưu ghế
      const seats = [];
      if (seatCapacity <= 16) {
        // Tạo ghế từ A01 đến A<seatCapacity>
        for (let i = 1; i <= seatCapacity; i++) {
          const seatNumber = `A${i.toString().padStart(2, "0")}`;
          seats.push({ trip: trip._id, seatNumber, status: SEAT_STATUS.EMPTY });
        }
      } else {
        // Chia ghế thành hai nhóm A và B
        const halfCapacity = Math.ceil(seatCapacity / 2);

        // Tạo nhóm A
        for (let i = 1; i <= halfCapacity; i++) {
          const seatNumber = `A${i.toString().padStart(2, "0")}`;
          seats.push({ trip: trip._id, seatNumber, status: SEAT_STATUS.EMPTY });
        }

        // Tạo nhóm B
        for (let i = 1; i <= seatCapacity - halfCapacity; i++) {
          const seatNumber = `B${i.toString().padStart(2, "0")}`;
          seats.push({ trip: trip._id, seatNumber, status: SEAT_STATUS.EMPTY });
        }
      }

      // Lưu danh sách ghế vào cơ sở dữ liệu
      await Seats.insertMany(seats);

      res.json({
        message: "Trip created successfully",
        trip,
        seats,
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  getTrips: async (req, res) => {
    try {
      const { page = PAGINATION.PAGE, limit = PAGINATION.LIMIT } = req.query;

      const trips = await Trip.find()
        .populate(["route", "bus"])
        .sort("-createdAt")
        .skip((page - 1) * limit)
        .limit(limit * 1)
        .exec();

      const count = await Trip.countDocuments();

      const totalPage = Math.ceil(count / limit);
      const currentPage = Number(page);
      // Tính số ghế trống cho mỗi chuyến xe và thêm vào dữ liệu chuyến xe
      for (let trip of trips) {
        const availableSeats = await Seats.countDocuments({
          trip: trip._id,
          status: SEAT_STATUS.EMPTY,
        });
        // Thêm availableSeats vào mỗi chuyến xe
        trip.availableSeats = availableSeats;
      }
      res.json({
        data: trips,
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

  getTrip: async (req, res) => {
    try {
      const { id } = req.params;

      const trip = await Trip.findById(id).populate(["route", "bus"]).exec();

      res.json(trip);
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  /* updateTrip: async (req, res) => {
    try {
      const { id } = req.params;
      const { route, bus, departureTime, arrivalTime } = req.body;

      const busInfo = await Bus.findById(bus).exec();
      const busRouteInfo = await BusRoutes.findById(route).exec();

      if (!busInfo || !busRouteInfo) {
        return res.status(404).json({
          message: "An error occurred, please try again",
        });
      }

      const newTrip = await Trip.findByIdAndUpdate(
        id,
        {
          route,
          bus,
          departureTime,
          arrivalTime,
        },
        { new: true }
      ).exec();

      res.json(newTrip);
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }, */

  updateTrip: async (req, res) => {
    try {
      const { id } = req.params;
      const { route, bus, departureTime, arrivalTime, status } = req.body;

      // Kiểm tra tính hợp lệ của status
      if (status && !Object.values(TRIP_STATUS).includes(status)) {
        return res.status(400).json({
          message: "Trạng thái bạn chọn không hợp lệ.",
        });
      }

      // Lấy thông tin xe buýt và tuyến xe
      const busInfo = await Bus.findById(bus).exec();
      const busRouteInfo = await BusRoutes.findById(route).exec();

      if (!busInfo || !busRouteInfo) {
        return res.status(404).json({
          message: "Không tìm thấy xe buýt hoặc tuyến đường, vui lòng thử lại.",
        });
      }

      // Kiểm tra trạng thái thời gian chuyến đi
      const now = new Date();
      const departureDate = new Date(departureTime);
      const arrivalDate = new Date(arrivalTime);

      if (departureDate <= now && now <= arrivalDate) {
        return res.status(400).json({
          message:
            "Không thể cập nhật trạng thái. Chuyến xe hiện tại đang chạy.",
        });
      }

      // Cập nhật chuyến đi
      const newTrip = await Trip.findByIdAndUpdate(
        id,
        {
          route,
          bus,
          departureTime,
          arrivalTime,
          status, // Cập nhật thêm trường status
        },
        { new: true } // Trả về document mới sau khi cập nhật
      ).exec();

      if (!newTrip) {
        return res.status(404).json({
          message: "Không tìm thấy chuyến xe, vui lòng thử lại",
        });
      }

      res.json(newTrip);
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  removeTrip: async (req, res) => {
    try {
      const { id } = req.params;

      const data = await Trip.findById(id).exec();
      const route = await BusRoutes.findById(data.route).exec();
      const bus = await Bus.findById(data.bus).exec();

      const trip = await Trip.findByIdAndDelete(id).exec();

      res.json(trip);
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },
  /* getTripsByRoute: async (req, res) => {
    try {
      // Bước 1: Lấy dữ liệu từ request
      const { startProvince, endProvince, departureDate } = req.query;
      console.log(
        "startProvince:",
        startProvince,
        "endProvince:",
        endProvince,
        "departureDate:",
        departureDate
      );

      // Bước 2: Tìm tuyến xe theo startProvince và endProvince
      const routes = await BusRoutes.find({
        startProvince,
        endProvince,
      }).exec();

      // Bước 2.1: Kiểm tra nếu không tìm thấy tuyến xe
      if (routes.length === 0) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy tuyến xe phù hợp." });
      }

      // Bước 2.2: Lấy danh sách ID của các tuyến xe tìm thấy
      const routeIds = routes.map((route) => route._id);

      // Bước 3: Tạo điều kiện truy vấn chuyến đi theo danh sách ID tuyến xe
      const tripsQuery = { route: { $in: routeIds } };

      // Bước 4: Xử lý logic về thời gian khởi hành
      if (departureDate) {
        const startOfDay = new Date(
          new Date(departureDate).setUTCHours(0, 0, 0, 0)
        );
        const endOfDay = new Date(
          new Date(departureDate).setUTCHours(23, 59, 59, 999)
        );
        tripsQuery.departureTime = { $gte: startOfDay, $lte: endOfDay };
      } else {
        tripsQuery.departureTime = { $gte: new Date() };
      }

      // Bước 5: Thực hiện truy vấn chuyến đi
      const trips = await Trip.find(tripsQuery)
        .populate(["route", "bus"])
        .exec();

      // Bước 6: Kiểm tra nếu không có chuyến xe phù hợp
      if (trips.length === 0) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy chuyến xe phù hợp." });
      }

      // Bước 7: Trả về danh sách chuyến xe phù hợp
      return res.status(200).json({ trips });
    } catch (error) {
      console.error("Error occurred:", error);
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }, */
  getTripsByRoute: async (req, res) => {
    try {
      const { startProvince, endProvince, departureDate } = req.query;
      console.log(
        "startProvince:",
        startProvince,
        "endProvince:",
        endProvince,
        "departureDate:",
        departureDate
      );

      const routes = await BusRoutes.find({
        startProvince,
        endProvince,
      }).exec();

      if (routes.length === 0) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy tuyến xe phù hợp." });
      }

      const routeIds = routes.map((route) => route._id);

      const tripsQuery = { route: { $in: routeIds } };

      if (departureDate) {
        const startOfDay = new Date(
          new Date(departureDate).setUTCHours(0, 0, 0, 0)
        );
        const endOfDay = new Date(
          new Date(departureDate).setUTCHours(23, 59, 59, 999)
        );
        tripsQuery.departureTime = { $gte: startOfDay, $lte: endOfDay };
      } else {
        tripsQuery.departureTime = { $gte: new Date() };
      }

      const trips = await Trip.find(tripsQuery)
        .populate(["route", "bus"])
        .exec();

      if (trips.length === 0) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy chuyến xe phù hợp." });
      }

      // Tính số ghế trống cho mỗi chuyến xe và thêm vào dữ liệu chuyến xe
      for (let trip of trips) {
        const availableSeats = await Seats.countDocuments({
          trip: trip._id,
          status: SEAT_STATUS.EMPTY,
        });
        // Thêm availableSeats vào mỗi chuyến xe
        trip.availableSeats = availableSeats;
      }

      return res.status(200).json({ trips });
    } catch (error) {
      console.error("Error occurred:", error);
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  },

  getBusAndSeatsByTripId: async (req, res) => {
    try {
      // Lấy ID chuyến xe từ params
      const { id } = req.params;

      // Bước 1: Tìm chuyến xe theo tripId và populate bus
      const trip = await Trip.findById(id).populate("bus");

      // Bước 2: Kiểm tra nếu không tìm thấy chuyến xe
      if (!trip) {
        return res.status(404).json({ message: "Không tìm thấy chuyến xe." });
      }

      // Bước 3: Lấy thông tin xe buýt từ chuyến xe
      const bus = trip.bus;

      // Bước 4: Kiểm tra nếu không tìm thấy xe buýt
      if (!bus) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy xe buýt cho chuyến này." });
      }

      // Bước 5: Lấy danh sách ghế thuộc chuyến xe
      const seats = await Seats.find({ trip: trip._id }); // Kiểm tra liên kết giữa ghế, xe và chuyến

      // Bước 5.1: Kiểm tra nếu không có ghế nào
      if (!seats.length) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy ghế cho chuyến này." });
      }

      // Bước 6: Trả về thông tin xe buýt và ghế
      return res.status(200).json({ bus, seats });
    } catch (error) {
      console.error("Error occurred:", error);
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  },
  getTripStats: async (req, res) => {
    try {
      const { startDate, endDate, type } = req.query;

      // Kiểm tra tham số đầu vào
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "Missing required parameters: startDate or endDate",
        });
      }

      const start = moment(startDate);
      const end = moment(endDate);

      if (!start.isValid() || !end.isValid()) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format",
        });
      }

      let dateFormat;
      let timeRange = [];

      // Tạo dãy thời gian (timeRange)
      if (type === "day") {
        dateFormat = "YYYY-MM-DD";
        for (let m = moment(start); m.isSameOrBefore(end); m.add(1, "days")) {
          timeRange.push(m.format(dateFormat));
        }
      } else if (type === "month") {
        dateFormat = "YYYY-MM";
        for (let m = moment(start); m.isSameOrBefore(end); m.add(1, "months")) {
          timeRange.push(m.format(dateFormat));
        }
      } else if (type === "year") {
        dateFormat = "YYYY";
        for (let year = start.year(); year <= end.year(); year++) {
          timeRange.push(year.toString());
        }
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid type parameter. Use "day", "month", or "year".',
        });
      }

      // Aggregate dữ liệu
      const tripStats = await Trip.aggregate([
        {
          $match: {
            arrivalTime: {
              $gte: new Date(startDate),
              $lte: new Date(endDate),
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format:
                  dateFormat === "YYYY-MM-DD"
                    ? "%Y-%m-%d"
                    : dateFormat === "YYYY-MM"
                    ? "%Y-%m"
                    : "%Y",
                date: "$arrivalTime",
              },
            },
            tripCount: { $sum: 1 }, // Đếm số chuyến xe
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      // Bổ sung dữ liệu thiếu (trả về 0 nếu không có chuyến xe trong ngày)
      const mappedData = timeRange.map((time) => {
        const found = tripStats.find((item) => item._id === time);
        return {
          label: time,
          tripCount: found ? found.tripCount : 0,
        };
      });

      res.json({
        success: true,
        data: mappedData, // Dữ liệu trả về với thống kê chuyến xe
      });
    } catch (error) {
      console.error("Error fetching trips:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
  getTripTop: async (req, res) => {
    try {
      // Query 1: Lấy danh sách `bus` và đếm số chuyến
      const tripStats = await Trip.aggregate([
        {
          $group: {
            _id: "$route", // Nhóm theo `bus`
            tripCount: { $sum: 1 }, // Đếm số chuyến
          },
        },
        { $sort: { tripCount: -1 } }, // Sắp xếp giảm dần
        { $limit: 10 }, // Lấy top 10
      ]);

      // Lấy danh sách `bus` từ kết quả
      const busIds = tripStats.map((stat) => stat._id);

      console.log(busIds);

      // Query 2: Lấy thông tin `startProvince` và `endProvince` từ bảng `busroutes`
      const busRoutes = await BusRoutes.find({ _id: busIds });

      // Map kết quả `tripStats` với `busRoutes`
      const result = tripStats.map((stat) => {
        const route = busRoutes.find(
          (route) => route._id.toString() == stat._id.toString()
        );
        return {
          label: route
            ? `${route.startProvince} -> ${route.endProvince}`
            : "Unknown Route", // Nếu không tìm thấy tuyến xe, gán nhãn là 'Unknown Route'
          tripCount: stat.tripCount,
        };
      });

      // Trả kết quả
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error fetching top routes:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch top routes",
      });
    }
  },
};

export default TripController;
