import { RequestHandler } from "express";

import Department from "../models/Department";

export const getDepartmentName: RequestHandler = async (__, res) => {
  try {
    const departments = await Department.find({}, "code name");
    const data = {};
    for (const department of departments) {
      data[department.code] = department.name;
    }

    return res.json({
      type: "SUCCESS",
      message: "Get department name list.",
      data: data,
    });
  } catch (error) {
    console.error(error);
    return res.status(504).json({ type: "ERROR", message: "Server error" });
  }
};

export const getDepartmentBoardName: RequestHandler = async (req, res) => {
  try {
    const departments = await Department.find(
      {},
      "code name board_names boards"
    );

    return res.json({
      type: "SUCCESS",
      message: "Get department board list.",
      data: departments,
    });
  } catch (error) {
    console.error(error);
    return res.status(506).json({ type: "ERROR", message: "Server error" });
  }
};
