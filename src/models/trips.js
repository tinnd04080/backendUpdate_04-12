import { model, Schema } from "mongoose";
import { TRIP_STATUS } from "../constants/index.js";
const tripSchema = new Schema(
  {
    route: {
      type: Schema.Types.ObjectId,
      ref: "busRoutes",
      required: true,
    },
    bus: {
      type: Schema.Types.ObjectId,
      ref: "buses",
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    availableSeats: {
      type: Number,
    },
    departureTime: {
      type: Date,
      required: true,
    },
    arrivalTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TRIP_STATUS),
      default: TRIP_STATUS.OPEN,
    },
  },
  { timestamps: true }
);

const Trip = model("trip", tripSchema);
export default Trip;
