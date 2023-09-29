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

import scrapeImages from "./utils/ScrapeImages.js";
import setMock from "./utils/SetMock.js";

dotenv.config();

const __dirname = path.resolve();
const app = express();
const port = 3000;

// Connect to MongoDB and Set Mock
await setMock();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../dist")));

// serve React
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist", "index.html"));
});

// email subscribe endpoint
app.post("/api/user/subscribe", async (req, res) => {
  const { email } = req.body;
  if (
    !email ||
    !email.includes("@") ||
    !email.includes(".") ||
    email.split("@")[0].length < 5
  ) {
    return res.json({ type: "ERROR", message: "Invalid email." });
  }

  // check subscribed
  const alreadySubscribed = await User.findOne({ email: email });
  if (alreadySubscribed) {
    return res.json({
      type: "NONE",
      message: "Already subscribed.",
    });
  }

  try {
    // save email to MongoDB
    const newEmail = new User({ email });
    await newEmail.save();
    res.json({ type: "SUCCESS", message: "Save user information:)" });
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

app.listen(port, () => {
  console.log("[Running] Server is running on port", port);
});

// 매 30분마다 실행
cron.schedule("0 0 0 * * *", () => {
  // RSS 데이터 가져오기
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
            console.log(message);
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
});

async function sendEmail(messages, department) {
  console.log("Sending email for All...");
  console.log(messages);
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
        console.log("All users are latest.");
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

  console.log(content);

  // if there is no new post, return
  if (count === 0) {
    return;
  }

  const mailOptions = {
    from: process.env.GOOGLE_MAIL_USER,
    to: user.email,
    subject: `[${department.name}] ${count}개의 새 소식이 왔습니다!`,
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
