import express from "express";
import path from "path";
import cron from "node-cron";
import axios from "axios";
import xml2js from "xml2js";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { createClient } from "redis";

import User from "./models/User.js";
import Department from "./models/Department.js";

import { scrapeNthImage } from "./utils/ScrapeImages.js";
import { setMock } from "./utils/SetMock.js";
import { sendEmail, sendEmailValidation } from "./utils/SendEmail.js";
import { isValid, isExistingEmail, isExpired } from "./utils/Utils.js";

dotenv.config();
const redisClient = createClient();
redisClient.on("error", (err) => console.log("Redis Client Error:", err));
await redisClient.connect();

const __dirname = path.resolve();
const app = express();
const PORT = process.env.NODE_ENV === "production" ? process.env.PORT : 3000;

// connect to database and set Mock.
await setMock();

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

  try {
    // check email validation.
    await sendEmailValidation(email);
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 9);
    console.log(`[Subscribing] ${email}:${department} (${startTime})`);
    await redisClient.set(email, department, { EX: 10 * 60 });
    return res.json({
      type: "SUCCESS",
      message: `이메일 검증을 위해 귀하(${email})의 메일함을 확인해주시기 바랍니다:) 메일함에 메일이 오지 않았다면 스팸메일함을 확인해보시기 바랍니다:)`,
    });
  } catch (error) {
    console.error(error);
    return res.status(501).json({ type: "ERROR", message: "Server error!" });
  }
});

// Endpoint: Email Validation
app.get("/api/user/validation/:email", async (req, res) => {
  const { email } = req.params;
  let code = null;
  // check if email exist in waiting queue.
  try {
    code = await redisClient.get(email);
    if (code === null) {
      throw new Error();
    }
    redisClient.del(email);
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

  const department = await Department.findOne({ code: code });

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
    return res.status(502).json({ type: "ERROR", message: "Server error!" });
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
    return res.json({ type: "SUCCESS", message: "Delete user information" });
  } catch (error) {
    console.error(error);
    return res.status(503).json({ type: "ERROR", message: "Server error!" });
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

    return res.json({
      type: "SUCCESS",
      message: "Get department list.",
      data: data,
    });
  } catch (error) {
    console.error(error);
    return res.status(504).json({ type: "ERROR", message: "Server error" });
  }
});

// Endpoint: Check whether email exists in database.
app.get("/api/email/existence", async (req, res) => {
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
});

// Endpoint: Get subscriber user count.
app.get("/api/email/count", async (req, res) => {
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
});

// Endpoint: Get project commit history.
app.get("/api/history", async (req, res) => {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_REPO_ACCESS_TOKEN;

  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits`;

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.json({
      type: "SUCCESS",
      message: "Get repo history.",
      data: {
        commits: response.data,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(505).json({
      type: "ERROR",
      message: "Server error",
      data: { commits: [] },
    });
  }
});

// Endpoint: React Routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist", "index.html"));
});

app.listen(PORT, () => {
  console.log("[Running] Server is running on port", PORT);
});

// cron job at 11:00, 18:00 on Korea. 시차 9시간.
cron.schedule("0 2,9 * * 1-5", async () => {
  const now = new Date();
  now.setHours(now.getHours() + 9);
  console.log(`[Cron] Fetching RSS data (${now}).`);
  try {
    const departments = await Department.find({});
    if (departments.length === 0) {
      console.log("[Cron] Department is nothing.");
      return;
    }

    for (const department of departments) {
      if (department.boards.length === 0) {
        console.log("[Cron] No RSS data on", department.code);
        return;
      }

      const messages = {};
      console.log("[Cron] Fetching RSS data on", department.code);

      for (const [idx, board] of department.boards.entries()) {
        let rssUrl = department.url + board;
        if (department.code.includes("snu")) {
          rssUrl += "";
        } else {
          rssUrl += "/rssList.do?row=5";
        }

        try {
          const res = await axios.get(rssUrl, {
            timeout: 3000,
            headers: {
              accept: "text/xml",
              "Content-Type": "application/rss+xml",
            },
          });
          if (res.status === 200) {
            const xmlData = res.data;

            // parse xml data.
            const result = await xml2js.parseStringPromise(xmlData);

            // get <item> data.
            const items = result.rss.channel[0].item.splice(0, 5);
            const message = {};
            let latestPostIndex = -1;

            // print item data.
            for (const item of items) {
              let postIdx = item.link[0].split("/")[6];
              let imageIdx = 1;
              if (department.code.includes("snu")) {
                postIdx = item.link[0].split("/")[4];
                imageIdx = 2;
              }

              if (Number(postIdx) > latestPostIndex) {
                latestPostIndex = Number(postIdx);
              }

              const images = await scrapeNthImage(item.link[0], imageIdx);

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
            };
          } else {
            console.log(`[Cron][${res.status}] Failed to fetch RSS data.`, res);
            // trash value
            messages[department.board_names[idx]] = {
              message: {},
              latestPostIndex: -1,
            };
          }
        } catch (error) {
          console.log("[Cron] Failed to fetch RSS data on axios.get", error);
          // trash value
          messages[department.board_names[idx]] = {
            message: {},
            latestPostIndex: -1,
            pastPostIndex: 1000000000,
          };
        }
      }

      await sendEmail(messages, department);
      console.log("[Cron] Finished working on", department.code);
    }

    console.log("[Cron] Finished all working on fetching RSS data.");
  } catch {
    console.log(error);
  }
});
