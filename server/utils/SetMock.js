import mongoose from "mongoose";
import Department from "../models/Department.js";
import User from "../models/User.js";
import { mockDepartments } from "../utils/DepartmentData.js";
import { mockUsers } from "../utils/UserData.js";

// connect to database and set Mock.
export async function setMock() {
  const CONNECTION_URL =
    process.env.NODE_ENV === "production"
      ? process.env.MONGO_ATLAS_CONNECTION_URL
      : process.env.MONGO_LOCAL_CONNECTION_URL;

  try {
    await mongoose.connect(CONNECTION_URL);
    console.log("[Success] MongoDB Connected");

    if (process.env.NODE_ENV !== "production") {
      // set department mock data and check if department already exists.
      for (const mockDepartment of mockDepartments) {
        const existed = await Department.findOne({ code: mockDepartment.code });
        if (!existed) {
          const department = new Department(mockDepartment);
          department
            .save()
            .then((savedDepartment) => {
              console.log("[Success] Department saved:", savedDepartment);
            })
            .catch((error) => {
              console.error("[Error] saving department:", error);
            });
        } else {
          console.log(`Department(${mockDepartment.code}) already exists.`);
        }
      }

      // set user mock data and check if user already exists.
      for (const mockUser of mockUsers) {
        const existed = await User.findOne({ email: mockUser.email });
        if (!existed) {
          const user = new User(mockUser);
          user
            .save()
            .then((savedUser) => {
              console.log("[Success] User saved:", savedUser);
            })
            .catch((error) => {
              console.error("[Error] saving user:", error);
            });
        } else {
          console.log(`User(${mockUser.email}) already exists.`);
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
}
