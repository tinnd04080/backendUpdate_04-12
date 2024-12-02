import { model, Schema } from "mongoose";
import { USER_STATUS } from "../constants/index.js";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    cccd: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String, // kiểu dữ liệu được định nghĩa là : Chuỗi
      enum: Object.values(USER_STATUS), // giới hạn giá trị chi trường status. chỉ được nằm trong danh sách các giá trị của USER_STATUS (ở đây là "ACTIVE" và "INACTIVE")
      required: true, // Trường status bắt buộc phải có giá trị khi tạo một bản ghi mới.
      default: USER_STATUS.ACTIVE, // Nếu không chỉ định giá trị status khi tạo, mặc định giá trị sẽ là "ACTIVE".
    },
  },
  { timestamps: true }
);

userSchema.set("toJSON", {
  transform: function (doc, ret, opt) {
    delete ret["password"];
    return ret;
  },
});

const User = model("users", userSchema);
export default User;
