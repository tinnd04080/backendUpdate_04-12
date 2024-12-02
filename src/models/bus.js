import { model, Schema } from "mongoose";
import { BUSES_STATUS } from "../constants/index.js";
const busSchema = new Schema(
  {
    // Các trường gộp từ busTypes
    busTypeName: {
      type: String,
      required: true,
    },
    seatCapacity: {
      type: Number,
      required: true,
    },
    priceFactor: {
      type: Number,
      required: true,
    },
    licensePlate: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: Object.values(BUSES_STATUS),
      default: BUSES_STATUS.OPEN,
    },
  },
  { timestamps: true }
);

const Bus = model("buses", busSchema);
export default Bus;
