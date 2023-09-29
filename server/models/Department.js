import mongoose, { Schema } from "mongoose";

const DepartmentSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  boards: {
    type: [Number],
    default: [],
  },
  board_names: {
    type: [String],
    default: [],
  },
});

export default mongoose.model("Department", DepartmentSchema);
