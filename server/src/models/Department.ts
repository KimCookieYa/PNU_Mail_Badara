import mongoose, { Schema, Document } from "mongoose";
import { DepartmentType } from "../types/DepartmentType";

// Department 인터페이스 정의
export interface IDepartment extends Document, DepartmentType {}

// Department 클래스 정의
class Department {
  code: string;
  name: string;
  url: string;
  boards: number[];
  board_names: string[];

  constructor(code: string, name: string, url: string) {
    this.code = code;
    this.name = name;
    this.url = url;
    this.boards = [];
    this.board_names = [];
  }
}

// Mongoose 스키마 정의
const DepartmentSchema: Schema = new Schema({
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

// Department 클래스를 스키마에 로드
DepartmentSchema.loadClass(Department);

// Mongoose 모델 생성
const DepartmentModel = mongoose.model<IDepartment>(
  "Department",
  DepartmentSchema
);

export default DepartmentModel;
