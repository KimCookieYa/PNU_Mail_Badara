import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  latest_post_indexs: {
    type: [Number],
    default: -1,
  },
  department_code: {
    type: String,
    required: true,
    default: "cse",
  },
});

export default mongoose.model("User", UserSchema);
