import { model, Schema } from "mongoose";
import { DISCOUNT_TYPE } from "../constants/index.js";
import { PROMOTIONT_STATUS } from "../constants/index.js";
const promotionSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    discountAmount: {
      type: Number,
      required: true,
    },
    quantity: {
      // thêm mới số lượng mã giảm được xuất ra . Thêm mới ngày 02/12
      type: Number,
      required: true,
    },
    remainingCount: {
      // số lượng mã còn lại. Thêm mới ngày 02/12
      type: Number,
    },
    discountType: {
      type: String,
      enum: Object.values(DISCOUNT_TYPE),
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      //Thêm mới ngày 02/12
      type: String,
      enum: Object.values(PROMOTIONT_STATUS),
      default: PROMOTIONT_STATUS.ACTIVE,
    },
  },
  { timestamps: true }
);

const Promotion = model("promotions", promotionSchema);

const promotionUsageSchema = new Schema(
  {
    promotion: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "promotions",
    },
    ticket: {
      type: Schema.Types.ObjectId,
      ref: "tickets",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  { timestamps: true }
);

export const PromotionUsage = model("promotionUsage", promotionUsageSchema);

export default Promotion;
