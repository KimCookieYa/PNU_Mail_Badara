import express from "express";
import path from "path";
import cron from "node-cron";
import axios from "axios";
import xml2js from "xml2js";
import cors from "cors";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

import User from "./models/User.js";
import Department from "./models/Department.js";

import { scrapeImages } from "./utils/ScrapeImages.js";
import { setMock } from "./utils/SetMock.js";

dotenv.config();
global.waitingQueue = {};

const __dirname = path.resolve();
const app = express();
const PORT = process.env.NODE_ENV === "production" ? process.env.PORT : 3000;

// Connect to MongoDB and Set Mock
await setMock();

// Create email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GOOGLE_MAIL_USER,
    pass: process.env.GOOGLE_MAIL_APP_PASSWORD,
  },
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../dist")));

// serve React
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist", "index.html"));
});

// check whether the email exists in the database
async function isExistingEmail(email) {
  return await User.findOne({ email: email });
}

// email subscribe endpoint
app.post("/api/user/subscribe", async (req, res) => {
  const { email, department } = req.body;
  if (
    !email ||
    !email.includes("@") ||
    !email.includes(".") ||
    email.split("@")[0].length < 5
  ) {
    return res.json({ type: "ERROR", message: "Invalid email." });
  }

  // check subscribed
  if (await isExistingEmail(email)) {
    return res.json({
      type: "NONE",
      message: `${email} is already subscribed to ${department}.`,
    });
  }

  // check email validation.
  const mailOptions = {
    from: process.env.GOOGLE_MAIL_USER,
    to: email,
    subject: "[PNU 메일 받아라] 이메일 검증 안내",
    html: `<div style="display: flex; flex-direction: column; gap: 10px">
            다음 버튼을 눌러 최종적으로 메일을 검증해주시기 바랍니다.
            <a href="${
              process.env.NODE_ENV === "production"
                ? process.env.PRODUCTION_URL
                : process.env.DEVELOPMENT_URL
            }/api/user/validation/${email}">
              <button>Validate</button>
            </a>
          </div>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    const startTime = new Date();
    global.waitingQueue[email] = {
      department_code: department,
      start_time: startTime,
    };
    res.json({
      type: "SUCCESS",
      message: `이메일 검증을 위해 귀하(${email})의 메일함을 확인해주시기 바랍니다:)`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ type: "ERROR", message: "Server error!" });
  }
});

// check whether the email verification period(10min) has expired.
function isExpired(startTime) {
  const endTime = new Date();
  const diff = endTime.getTime() - startTime.getTime();
  return diff > 1000 * 60 * 10;
}

// email validation endpoint
app.get("/api/user/validation/:email", async (req, res) => {
  const { email } = req.params;

  // check if email exist in waiting queue
  if (!(email in global.waitingQueue)) {
    res.status(500).json({
      type: "ERROR",
      message: "Server error! Your email don't exist in waiting queue.",
    });
  }

  // check if email validation is expired
  if (isExpired(global.waitingQueue[email].start_time)) {
    delete global.waitingQueue[email];
    res.status(500).json({
      type: "ERROR",
      message: "Your email validation is expired.",
    });
  }

  // check if email exist in database
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
    // save email to MongoDB
    const newEmail = new User({
      email: email,
      department_code: department.code,
      latest_post_indexs: Array(department.boards.length).fill(-1),
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
    res.status(500).json({ type: "ERROR", message: "Server error!" });
  }
});

// email delete endpoint
app.delete("/api/user/unsubscribe/:email", async (req, res) => {
  const { email } = req.params;

  try {
    // check subscribed
    const temp = await User.findOne({ email });
    if (!temp) {
      return res.json({
        type: "NONE",
        message: "Not subscribed.",
      });
    }
    // 이메일을 MongoDB에서 삭제
    await User.deleteOne({ email });
    res.json({ type: "SUCCESS", message: "Delete user information" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ type: "ERROR", message: "Server error!" });
  }
});

// department endpoint
app.get("/api/department", async (req, res) => {
  try {
    const departments = await Department.find({}, "code name");
    const data = {};
    for (const department of departments) {
      data[department.code] = department.name;
    }

    console.log("Get department list.");
    res.json({
      type: "SUCCESS",
      message: "Get department list.",
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ type: "ERROR", message: "Server error" });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist", "index.html"));
});

app.listen(PORT, () => {
  console.log("[Running] Server is running on port", PORT);
});

// cron job at 18:00
cron.schedule("* 3,12 * * *", () => {
  console.log("[Cron] Fetching RSS data.");
  Department.find({}).then((departments) => {
    if (departments.length === 0) {
      console.log("[Cron] Department is nothing.");
      return;
    }

    departments.forEach(async (department) => {
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

            // XML 파싱
            const result = await xml2js.parseStringPromise(xmlData);

            // <item> 태그 내의 정보 가져오기
            const items = result.rss.channel[0].item.splice(0, 3);
            const message = {};
            let latestPostIndex = -1;
            // 각 아이템 정보 출력
            for (const item of items) {
              const postIdx = item.link[0].split("/")[6];
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
            };
          } else {
            console.error("[Cron] Failed to fetch RSS data.");
          }
        } catch (error) {
          console.error(error);
        }
      }

      await sendEmail(messages, department);
    });
  });

  // delete expired e-mails from the waiting list
  console.log("[Cron] Deleting expired e-mails.");
  Object.keys(global.waitingQueue).forEach((email) => {
    if (isExpired(global.waitingQueue[email].start_time)) {
      console.log("[Cron] Expired e-mail: ", email);
      delete global.waitingQueue[email];
    }
  });
});

async function sendEmail(messages, department) {
  console.log("Sending email for All...");
  //console.log(messages);
  const values = Object.values(messages);
  const condition = Array.from({ length: values.length }, (_, idx) => ({
    [`latest_post_indexs.${idx}`]: { $lt: values[idx].latestPostIndex },
  }));
  const query = {
    department_code: department.code,
  };
  if (condition.length > 0) {
    query.$or = condition;
  }
  await User.find(query)
    .then((users) => {
      if (users.length === 0) {
        console.log(`All users of ${department.name} are latest.`);
        return;
      }
      users.forEach((user) => {
        sendEmailFor(user, messages, department);
      });
    })
    .catch((error) => {
      console.log(error);
    });
}

async function sendEmailFor(user, messages, department) {
  let count = 0;
  let boardIdx = 0;
  let content = "";
  const boardNames = Object.keys(messages);
  const updatedLatestPostIndexs = [];
  for (const boardName of boardNames) {
    const message = messages[boardName];
    const postIdxs = Object.keys(message.message);
    updatedLatestPostIndexs.push(message.latestPostIndex);

    content += `<br /><br />
                <h1>[${department.name}] ${boardName}</h1>
                <div style="background-color: black; width: 40vw; height: 3px"/>`;
    let latestPostIndexs = user.latest_post_indexs;

    for (const postIdx of postIdxs) {
      const postIndex = Number(postIdx);
      if (postIndex > latestPostIndexs[boardIdx]) {
        content += `<div style='display: flex; flex-direction: column; margin: 10px'>
                      <p>제목:
                        <a href="${message.message[postIndex].link}">
                          ${message.message[postIndex].title}
                        </a>
                        <br />
                        게시일: ${message.message[postIndex].pubDate}
                      </p>
                    </div>`;
        for (const img of message.message[postIndex].images) {
          content += `<img src="${img}" alt="image" style="width: 60vw">`;
        }
        count++;
      }
    }
    boardIdx++;
  }
  content += `<a href="${
    process.env.NODE_ENV === "production"
      ? process.env.PRODUCTION_URL
      : process.env.DEVELOPMENT_URL
  }">Unsubscribe</a>`;

  // if there is no new post, return
  if (count === 0) {
    return;
  }

  const mailOptions = {
    from: process.env.GOOGLE_MAIL_USER,
    to: user.email,
    subject: `[PNU 메일 받아라] ${department.name}에서 ${count}개의 새 소식이 왔습니다!`,
    html: content,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("[Success] Send email to", user.email);
    await User.updateOne(
      { email: user.email },
      { latest_post_indexs: updatedLatestPostIndexs }
    );
  } catch (error) {
    console.error(error);
  }
}
