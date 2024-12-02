import { model, Schema } from "mongoose";
import { ROLE } from "../constants/index.js";

const permissionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(ROLE),
      required: true,
    },
  },
  { timestamps: true }
);

const Permission = model("permissions", permissionSchema);
export default Permission;
