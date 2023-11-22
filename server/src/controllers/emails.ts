import { RequestHandler } from "express";

import User from "../models/User";

export const getSendEmail: RequestHandler = async (req, res) => {
  const { email } = req.query;

  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.json({
        type: "SUCCESS",
        message: email + " exists in db.",
        data: { exist: true },
      });
    } else {
      return res.json({
        type: "ERROR",
        message: email + " doesn't exist in db.",
        data: { exist: false },
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(505).json({
      type: "ERROR",
      message: "Server error",
      data: { exist: false },
    });
  }
};

export const getEmailCount: RequestHandler = async (__, res) => {
  try {
    const user = await User.find();
    return res.json({
      type: "SUCCESS",
      message: user.length + " users is subscribing.",
      data: { count: user.length },
    });
  } catch (error) {
    console.error(error);
    return res.status(505).json({
      type: "ERROR",
      message: "Server error",
      data: { count: 0 },
    });
  }
};
