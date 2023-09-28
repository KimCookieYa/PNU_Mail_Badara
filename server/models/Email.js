import mongoose, { Schema } from "mongoose";

const EmailSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  latest: {
    type: Number,
    default: -1,
  },
});

export const Email = mongoose.model("Email", EmailSchema);
