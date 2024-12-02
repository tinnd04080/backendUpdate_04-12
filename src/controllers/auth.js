import User from "../models/users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ROLE } from "../constants/index.js";
import { USER_STATUS } from "../constants/index.js";
import Permission from "../models/permissions.js";
import crypto from "crypto";
import OtpCodes from "../models/otpCodes.js";
import sendMail from "../utils/sendMail.js";
import dayjs from "dayjs";

const AuthController = {
  // signUp: async (req, res) => {
  //   const { userName, password, email, phoneNumber, fullName, cccd } = req.body;

  //   try {
  //     const emailOrPhoneExists = await User.findOne({
  //       $or: [{ email }, { phoneNumber }],
  //     }).exec();

  //     if (emailOrPhoneExists) {
  //       return res.status(400).json({
  //         message: "Email hoặc số điện thoại đã tồn tại",
  //       });
  //     }

  //     const salt = await bcrypt.genSalt(10);
  //     const hashedPassword = await bcrypt.hash(password, salt);

  //     const userCount = await User.countDocuments();
  //     const role = userCount > 0 ? ROLE.CUSTOMER : ROLE.ADMIN;

  //     const user = await new User({
  //       userName,
  //       password,
  //       email,
  //       phoneNumber,
  //       fullName,
  //       cccd,
  //       password: hashedPassword,
  //     }).save();

  //     // send email verify
  //     const expireMinutes = 15;
  //     const otp = crypto.randomInt(100000, 999999).toString();
  //     const otpExpires = new Date(Date.now() + expireMinutes * 60 * 1000);

  //     await sendMail({
  //       toEmail: email,
  //       title: "Xác thực tài khoản",
  //       content: `Mã xác thực tài khoản của bạn là: ${otp}. Vui lòng nhập mã OTP để xác minh tài khoản, mã OTP có hiệu lực tối đa ${expireMinutes} phút.`,
  //     });

  //     await new OtpCodes({
  //       user: user._id,
  //       code: otp,
  //       expired: otpExpires,
  //     }).save();

  //     // save permission
  //     await new Permission({
  //       user: user._id,
  //       role,
  //     }).save();

  //     res.status(201).json({
  //       status: true,
  //       message: "Đăng ký tài khoản thành công",
  //     });
  //   } catch (error) {
  //     res.status(500).json({
  //       message: "Internal server error",
  //       error: error.message,
  //     });
  //   }
  // },

  /* signUp: async (req, res) => {
    const { userName, password, email, phoneNumber, fullName, cccd } = req.body;

    try {
      // Kiểm tra xem email hoặc số điện thoại đã tồn tại chưa
      const emailOrPhoneExists = await User.findOne({
        $or: [{ email }, { phoneNumber }],
      }).exec();

      if (emailOrPhoneExists) {
        return res.status(400).json({
          message: "Email hoặc số điện thoại đã tồn tại",
        });
      }

      // Mã hóa mật khẩu
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Kiểm tra số lượng người dùng và gán quyền
      const userCount = await User.countDocuments();
      const role = userCount > 0 ? ROLE.CUSTOMER : ROLE.ADMIN;

      // Lưu thông tin người dùng mới
      const user = await new User({
        userName,
        password,
        email,
        phoneNumber,
        fullName,
        cccd,
        password: hashedPassword,
      }).save();

      // Gửi mã OTP xác thực
      const expireMinutes = 15;
      const otp = crypto.randomInt(100000, 999999).toString();
      const otpExpires = new Date(Date.now() + expireMinutes * 60 * 1000);

      await sendMail({
        toEmail: email,
        title: "Xác thực tài khoản",
        content: `Mã xác thực tài khoản của bạn là: ${otp}. Vui lòng nhập mã OTP để xác minh tài khoản, mã OTP có hiệu lực tối đa ${expireMinutes} phút.`,
      });

      // Lưu mã OTP vào database
      await new OtpCodes({
        user: user._id,
        code: otp,
        expired: otpExpires,
      }).save();

      // Lưu quyền cho người dùng
      await new Permission({
        user: user._id,
        role,
      }).save();

      // Đăng ký thành công và gửi phản hồi
      res.status(201).json({
        status: true,
        message:
          "Đăng ký tài khoản thành công. Mã OTP đã được gửi đến email của bạn.",
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }, */

  /* Đăng ký. Update 02/12 . Phân quyền khi thêm người dùng ở webadmin - còn nhiều lỗi  */
  /*   signUp: async (req, res) => {
    const { userName, password, email, phoneNumber, fullName, cccd, role } =
      req.body;

    try {
      // Kiểm tra xem email hoặc số điện thoại đã tồn tại chưa
      const emailOrPhoneExists = await User.findOne({
        $or: [{ email }, { phoneNumber }],
      }).exec();

      if (emailOrPhoneExists) {
        return res.status(400).json({
          message: "Email hoặc số điện thoại đã tồn tại",
        });
      }

      // Mã hóa mật khẩu
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Xác định vai trò dựa trên input từ người dùng hoặc mặc định là CUSTOMER
      const validRoles = Object.values(ROLE); // ["ADMIN", "STAFF", "CUSTOMER"]
      const userRole = validRoles.includes(role) ? role : ROLE.CUSTOMER;

      // Lưu thông tin người dùng mới
      const user = await new User({
        userName,
        password: hashedPassword,
        email,
        phoneNumber,
        fullName,
        cccd,
      }).save();

      // Gửi mã OTP xác thực
      const expireMinutes = 15;
      const otp = crypto.randomInt(100000, 999999).toString();
      const otpExpires = new Date(Date.now() + expireMinutes * 60 * 1000);

      await sendMail({
        toEmail: email,
        title: "Xác thực tài khoản",
        content: `Mã xác thực tài khoản của bạn là: ${otp}. Vui lòng nhập mã OTP để xác minh tài khoản, mã OTP có hiệu lực tối đa ${expireMinutes} phút.`,
      });

      // Lưu mã OTP vào database
      await new OtpCodes({
        user: user._id,
        code: otp,
        expired: otpExpires,
      }).save();

      // Lưu quyền cho người dùng
      await new Permission({
        user: user._id,
        role: userRole,
      }).save();

      // Đăng ký thành công và gửi phản hồi
      res.status(201).json({
        status: true,
        message:
          "Đăng ký tài khoản thành công. Mã OTP đã được gửi đến email của bạn.",
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }, */
  /* Đăng ký. Update 02/12 . Phân quyền khi thêm người dùng ở webadmin - đã hoàn thành */
  signUp: async (req, res) => {
    const {
      userName,
      password,
      email,
      phoneNumber,
      fullName,
      cccd,
      role,
      status,
    } = req.body;

    try {
      // Kiểm tra xem email hoặc số điện thoại đã tồn tại chưa
      const emailOrPhoneExists = await User.findOne({
        $or: [{ email }, { phoneNumber }],
      }).exec();

      if (emailOrPhoneExists) {
        return res.status(400).json({
          message: "Email hoặc số điện thoại đã tồn tại",
        });
      }

      // Mã hóa mật khẩu
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Xác định vai trò dựa trên input từ người dùng hoặc mặc định là CUSTOMER
      const validRoles = Object.values(ROLE); // ["ADMIN", "STAFF", "CUSTOMER"]
      const userRole = validRoles.includes(role) ? role : ROLE.CUSTOMER;

      // Xác định trạng thái dựa vào input hoặc mặc định là ACTIVE
      const validStatuses = Object.values(USER_STATUS); // ["ACTIVE", "INACTIVE"]
      const userStatus = validStatuses.includes(status)
        ? status
        : USER_STATUS.ACTIVE;

      // Lưu thông tin người dùng mới
      const user = await new User({
        userName,
        password: hashedPassword,
        email,
        phoneNumber,
        fullName,
        cccd,
        status: userStatus, // Thêm trường trạng thái
      }).save();

      // Gửi mã OTP xác thực
      const expireMinutes = 15;
      const otp = crypto.randomInt(100000, 999999).toString();
      const otpExpires = new Date(Date.now() + expireMinutes * 60 * 1000);

      await sendMail({
        toEmail: email,
        title: "Xác thực tài khoản",
        content: `Mã xác thực tài khoản của bạn là: ${otp}. Vui lòng nhập mã OTP để xác minh tài khoản, mã OTP có hiệu lực tối đa ${expireMinutes} phút.`,
      });

      // Lưu mã OTP vào database
      await new OtpCodes({
        user: user._id,
        code: otp,
        expired: otpExpires,
      }).save();

      // Lưu quyền cho người dùng
      await new Permission({
        user: user._id,
        role: userRole,
      }).save();

      // Đăng ký thành công và gửi phản hồi
      res.status(201).json({
        status: true,
        message:
          "Đăng ký tài khoản thành công. Mã OTP đã được gửi đến email của bạn.",
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },
  /* signIn: async (req, res) => {
    const { email, password } = req.body;

    try {
      // check email registered
      const findUser = await User.findOne({ email }).exec();

      if (!findUser) {
        return res.status(404).json({ message: "Tài khoản chưa đăng ký!" });
      }

      // kiểm tra tài khoản đã xác minh chưa
      if (!findUser.isVerified) {
        return res
          .status(400)
          .json({ message: "Tài khoản chưa được xác minh" });
      }

      // check password
      const isPasswordValid = await bcrypt.compare(password, findUser.password);

      if (!isPasswordValid) {
        return res.status(400).json({ message: "Mật khẩu không chính xác!" });
      }

      const role = await Permission.findOne({ user: findUser._id }).exec();

      const token = jwt.sign(
        {
          id: findUser._id,
          email: findUser.email,
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "30d" }
      );

      res.json({
        user: {
          ...findUser.toJSON(),
          role: role.role,
        },
        token,
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }, */
  /* Login update 02/12 */
  signIn: async (req, res) => {
    const { email, password } = req.body;

    try {
      // Kiểm tra xem người dùng có tồn tại không
      const findUser = await User.findOne({ email }).exec();

      if (!findUser) {
        return res.status(404).json({ message: "Tài khoản chưa đăng ký!" });
      }

      // Kiểm tra tài khoản đã được xác minh chưa
      if (!findUser.isVerified) {
        return res
          .status(400)
          .json({ message: "Tài khoản chưa được xác minh" });
      }

      // Kiểm tra trạng thái người dùng
      if (findUser.status === "INACTIVE") {
        return res
          .status(403)
          .json({
            message: "Tài khoản của bạn đang bị khóa, không thể đăng nhập",
          });
      }

      // Kiểm tra mật khẩu
      const isPasswordValid = await bcrypt.compare(password, findUser.password);

      if (!isPasswordValid) {
        return res.status(400).json({ message: "Mật khẩu không chính xác!" });
      }

      // Lấy quyền (role) của người dùng
      const role = await Permission.findOne({ user: findUser._id }).exec();

      // Tạo token JWT
      const token = jwt.sign(
        {
          id: findUser._id,
          email: findUser.email,
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "30d" }
      );

      // Trả về thông tin người dùng và token
      res.json({
        user: {
          ...findUser.toJSON(),
          role: role.role,
        },
        token,
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },
  verifyOtp: async (req, res) => {
    try {
      const { email, otp } = req.body;

      const user = await User.findOne({ email }).exec();

      if (!user) {
        return res.status(404).json({
          message: "Không tìm thấy tài khoản",
        });
      }

      const otpData = await OtpCodes.findOne({
        user: user._id,
        code: otp,
      }).exec();
      if (!otpData) {
        return res.status(404).json({ message: "Mã OTP không chính xác" });
      }

      const isExpired = dayjs(otpData.expired).diff(dayjs()) <= 0;
      if (isExpired) {
        return res.status(400).json({ message: "Mã OTP đã hết hạn" });
      }

      user.isVerified = true;
      await user.save();

      await OtpCodes.findByIdAndDelete(otpData._id);
      res.json({ message: "Xác minh tài khoản thành công" });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  resendOtp: async (req, res) => {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email }).exec();

      if (!user) {
        return res.status(404).json({
          message: "Không tìm thấy tài khoản",
        });
      }

      if (user.isVerified) {
        return res.json({
          message: "Tài khoản đã được xác minh",
        });
      }

      // send email verify
      const expireMinutes = 15;
      const otp = crypto.randomInt(100000, 999999).toString();
      const otpExpires = new Date(Date.now() + expireMinutes * 60 * 1000);

      await sendMail({
        toEmail: email,
        title: "Xác thực tài khoản",
        content: `Mã xác thực tài khoản của bạn là: ${otp}. Vui lòng nhập mã OTP để xác minh tài khoản, mã OTP có hiệu lực tối đa ${expireMinutes} phút.`,
      });

      await OtpCodes.findOneAndUpdate(
        { user: user._id },
        { code: otp, expired: otpExpires }
      ).exec();

      res.json(true);
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },
};

export default AuthController;
