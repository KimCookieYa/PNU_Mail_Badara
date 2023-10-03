import express from "express";
import path from "path";
import cron from "node-cron";
import axios from "axios";
import xml2js from "xml2js";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

import User from "./models/User.js";
import Department from "./models/Department.js";

import { scrapeImages } from "./utils/ScrapeImages.js";
import { setMock } from "./utils/SetMock.js";
import { sendEmail, sendEmailValidation } from "./utils/SendEmail.js";
import { isValid, isExistingEmail, isExpired } from "./utils/Utils.js";

dotenv.config();
global.waitingQueue = {};

// create email transporter.
global.transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GOOGLE_MAIL_USER_ID,
    pass: process.env.GOOGLE_MAIL_APP_PASSWORD,
  },
});

const __dirname = path.resolve();
const app = express();
const PORT = process.env.NODE_ENV === "production" ? process.env.PORT : 3000;

// connect to database and set Mock.
if (process.env.NODE_ENV !== "production") {
  await setMock();
}

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../dist")));

// serve react.
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist", "index.html"));
});

// Endpoint: Email Subscribe
app.post("/api/user/subscribe", async (req, res) => {
  const { email, department } = req.body;

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

  // TODO: check waiting queue.

  try {
    // check email validation.
    await sendEmailValidation(global.transporter, email);
    const startTime = new Date();
    global.waitingQueue[email] = {
      department_code: department,
      start_time: startTime,
    };
    console.log(`[Subscribing] ${email}:${department} (${startTime})`);
    res.json({
      type: "SUCCESS",
      message: `이메일 검증을 위해 귀하(${email})의 메일함을 확인해주시기 바랍니다:)`,
    });
  } catch (error) {
    console.error(error);
    res.status(501).json({ type: "ERROR", message: "Server error!" });
  }
});

// Endpoint: Email Validation
app.get("/api/user/validation/:email", async (req, res) => {
  const { email } = req.params;

  // check if email exist in waiting queue.
  if (!(email in global.waitingQueue)) {
    res.status(500).json({
      type: "ERROR",
      message: "Server error! Your email don't exist in waiting queue.",
    });
  }

  // check if email validation is expired.
  if (isExpired(global.waitingQueue[email].start_time)) {
    delete global.waitingQueue[email];
    res.status(500).json({
      type: "ERROR",
      message: "Your email validation is expired.",
    });
  }

  // check if email exist in database.
  const existingEmail = await isExistingEmail(email);
  if (existingEmail) {
    res.status(500).json({
      type: "ERROR",
      message: "Your email already exists in the database.",
    });
  }

  const department = await Department.findOne({
    code: global.waitingQueue[email].department_code,
  });

  try {
    // save email to MongoDB.
    const newEmail = new User({
      email: email,
      department_code: department.code,
      latest_post_indexs: Array(department.boards.length).fill(-1),
      subscribe_time: new Date(),
    });
    await newEmail.save();
    res.redirect(
      `${
        process.env.NODE_ENV === "production"
          ? process.env.PRODUCTION_URL
          : process.env.DEVELOPMENT_URL
      }/validation/${email}`
    );
  } catch (error) {
    console.error(error);
    res.status(502).json({ type: "ERROR", message: "Server error!" });
  }
});

// Endpoint: Email Delete
app.delete("/api/user/unsubscribe/:email", async (req, res) => {
  const { email } = req.params;

  if (!isValid(email)) {
    return res.json({ type: "ERROR", message: "Invalid email." });
  }

  try {
    // check if email already subscribed.
    const existingEmail = await isExistingEmail(email);
    if (!existingEmail) {
      return res.json({
        type: "NONE",
        message: `${email} is not subscribed.`,
      });
    }

    // delete email in database.
    await User.deleteOne({ email });
    res.json({ type: "SUCCESS", message: "Delete user information" });
  } catch (error) {
    console.error(error);
    res.status(503).json({ type: "ERROR", message: "Server error!" });
  }
});

// Endpoint: Get Department
app.get("/api/department", async (req, res) => {
  try {
    const departments = await Department.find({}, "code name");
    const data = {};
    for (const department of departments) {
      data[department.code] = department.name;
    }

    res.json({
      type: "SUCCESS",
      message: "Get department list.",
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(504).json({ type: "ERROR", message: "Server error" });
  }
});

// Endpoint: React Routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist", "index.html"));
});

app.listen(PORT, () => {
  console.log("[Running] Server is running on port", PORT);
});

// cron job at 10:00, 19:00 on Korea.
cron.schedule("0 1,10 * * *", () => {
  const now = new Date();
  console.log(`[Cron] Fetching RSS data (${now}).`);
  Department.find({})
    .then(async (departments) => {
      if (departments.length === 0) {
        console.log("[Cron] Department is nothing.");
        return;
      }

      for (const department of departments) {
        if (department.boards.length === 0) {
          console.log("[Cron] No RSS data for", department.code);
          return;
        }

        const messages = {};
        console.log("[Cron] Fetching RSS data for", department.code);

        for (const [idx, board] of department.boards.entries()) {
          const rssUrl = department.url + board + "/rssList.do?row=3";
          try {
            const res = await axios.get(rssUrl);
            if (res.status === 200) {
              const xmlData = res.data;

              // parse xml data.
              const result = await xml2js.parseStringPromise(xmlData);

              // get <item> data.
              const items = result.rss.channel[0].item.splice(0, 3);
              const message = {};
              let latestPostIndex = -1;
              let pastPostIndex = 1000000000;

              // print item data.
              for (const item of items) {
                const postIdx = item.link[0].split("/")[6];
                if (Number(postIdx) < pastPostIndex) {
                  pastPostIndex = Number(postIdx);
                }
                if (Number(postIdx) > latestPostIndex) {
                  latestPostIndex = Number(postIdx);
                }

                const images = await scrapeImages(item.link[0]);

                message[postIdx] = {
                  title: item.title[0],
                  images: images,
                  link: item.link[0],
                  pubDate: item.pubDate[0],
                };
              }
              //console.log(message);
              messages[department.board_names[idx]] = {
                message,
                latestPostIndex,
                pastPostIndex,
              };
            } else {
              console.error("[Cron] Failed to fetch RSS data.".res);
              // trash value
              messages[department.board_names[idx]] = {
                message: {},
                latestPostIndex: -1,
                pastPostIndex: 1000000000,
              };
            }
          } catch (error) {
            console.error(error);
            // trash value
            messages[department.board_names[idx]] = {
              message: {},
              latestPostIndex: -1,
              pastPostIndex: 1000000000,
            };
          }
        }

        await sendEmail(global.transporter, messages, department);
      }
    })
    .catch((error) => {
      console.log(error);
    });

  // delete expired e-mails from the waiting list.
  console.log("[Cron] Deleting expired e-mails.");
  Object.keys(global.waitingQueue).forEach((email) => {
    if (isExpired(global.waitingQueue[email].start_time)) {
      console.log("[Cron] Expired e-mail: ", email);
      delete global.waitingQueue[email];
    }
  });
});
