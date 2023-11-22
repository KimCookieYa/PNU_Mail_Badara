import { RequestHandler } from "express";

import User from "../models/User";
import Department from "../models/Department";

import {
  isValid,
  isExistingEmail,
  sendEmailValidation,
  sendSubscritionSuccessEmail,
} from "../utils/util";
import { getRedisClient } from "../utils/redisClient";

export const postRegisterUser: RequestHandler = async (req, res) => {
  const { email, department } = req.body;
  const redisClient = getRedisClient();

  if (!isValid(email)) {
    return res.json({ type: "ERROR", message: "Invalid email." });
  }

  // check if email already subscribed.
  const existingEmail = await isExistingEmail(email);
  if (existingEmail) {
    return res.json({
      type: "NONE",
      message: `${email} is already subscribed to ${department}.`,
    });
  }

  // check email validation.
  try {
    await sendEmailValidation(email);
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 9);
    console.log(`[Subscribing] ${email}:${department} (${startTime})`);
    await redisClient.set(email, department, "EX", 10 * 60, (err) => {
      if (err) {
        throw new Error(err);
      }
    });
    return res.json({
      type: "SUCCESS",
      message: `이메일 검증을 위해 귀하(${email})의 메일함을 확인해주시기 바랍니다:) 메일함에 메일이 오지 않았다면 스팸메일함을 확인해보시기 바랍니다:)`,
    });
  } catch (error) {
    console.error(error);
    return res.status(501).json({ type: "ERROR", message: "Server error!" });
  }
};

export const getValidateEmail: RequestHandler = async (req, res) => {
  const { email } = req.params;
  const redisClient = getRedisClient();

  let code: string = "";
  // check if email exist in waiting queue.
  try {
    code = await redisClient.get(email, (err, code) => {
      if (err) {
        throw new Error(err);
      }
      return code;
    });
    if (!code) {
      throw new Error();
    }
    redisClient.del(email, (err) => {
      if (err) {
        throw new Error(err);
      }
    });
  } catch (error) {
    return res.status(500).json({
      type: "ERROR",
      message:
        "Server error! While checking your email exist in waiting queue, Error occured.",
      error,
    });
  }

  // check if email exist in database.
  const existingEmail = await isExistingEmail(email);
  if (existingEmail) {
    return res.status(500).json({
      type: "ERROR",
      message: "Your email already exists in the database.",
    });
  }

  try {
    const department = await Department.findOne({ code: code });
    if (!department) {
      throw new Error("Department not found.");
    }

    // save email to MongoDB.
    const newEmail = new User({
      email: email,
      department_code: department.code,
      latest_post_indexs: Array(department.boards.length).fill(-1),
      subscribe_time: new Date(),
    });
    await newEmail.save();
    await sendSubscritionSuccessEmail(email, department.name);
    console.log(
      `[Subscribe Success] ${email}:${department.code} subscription to a has been successfully completed.`
    );
    res.redirect(
      `${
        process.env.NODE_ENV === "production"
          ? process.env.PRODUCTION_URL
          : process.env.DEVELOPMENT_URL
      }/validation/${email}`
    );
  } catch (error) {
    console.error(error);
    return res.status(502).json({ type: "ERROR", message: "Server error!" });
  }
};

export const deleteUser: RequestHandler = async (req, res) => {
  const { email } = req.params;

  if (!isValid(email)) {
    return res.json({ type: "ERROR", message: "Invalid email." });
  }

  // check if email already subscribed.
  try {
    const existingEmail = await isExistingEmail(email);
    if (!existingEmail) {
      return res.json({
        type: "NONE",
        message: `${email} is not subscribed.`,
      });
    }

    // delete email in database.
    await User.deleteOne({ email });
    return res.json({ type: "SUCCESS", message: "Delete user information" });
  } catch (error) {
    console.error(error);
    return res.status(503).json({ type: "ERROR", message: "Server error!" });
  }
};
