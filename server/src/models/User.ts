import mongoose, { Schema, Document } from "mongoose";
import { UserType } from "../types/UserType";

// User 인터페이스 정의
export interface IUser extends Document, UserType {}

// User 클래스 정의
class User {
  email: string;
  latest_post_indexes: number[];
  department_code: string;
  subscribe_time: Date;

  constructor(email: string, departmentCode: string) {
    this.email = email;
    this.latest_post_indexes = [-1];
    this.department_code = departmentCode;
    this.subscribe_time = new Date();
  }
}

// Mongoose 스키마 정의
const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  latest_post_indexes: {
    type: [Number],
    default: -1,
  },
  department_code: {
    type: String,
    required: true,
    default: "cse",
  },
  subscribe_time: {
    type: Date,
    default: Date.now,
  },
});

// User 클래스를 스키마에 로드
UserSchema.loadClass(User);

// Mongoose 모델 생성
const UserModel = mongoose.model<IUser>("User", UserSchema);

export default UserModel;
