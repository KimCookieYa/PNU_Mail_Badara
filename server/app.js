import express from "express";
import path from "path";
import cron from "node-cron";
import axios from "axios";
import xml2js from "xml2js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import { Email } from "./models/Email.js";
import nodemailer from "nodemailer";
import { scrapeImages } from "./utils/scrapeImages.js";

dotenv.config();

const rssUrl = "https://cse.pusan.ac.kr/bbs/cse/2616/rssList.do?row=50";

const __dirname = path.resolve();
const app = express();
const port = 3000;

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((error) => {
    console.error(error);
  });

// 정적 파일 제공
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../dist")));

// 루트 엔드포인트에서 React 앱을 서비스
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist", "index.html"));
});

app.post("/api/user/subscribe", async (req, res) => {
  const { email } = req.body;
  if (
    !email ||
    !email.includes("@") ||
    !email.includes(".") ||
    email.split("@")[0].length < 5
  ) {
    return res.json({ type: "NONE", message: "이메일 주소가 필요합니다." });
  }

  // 이메일 중복 체크
  const alreadySubscribed = await Email.findOne({ email: email });
  if (alreadySubscribed) {
    return res.json({
      type: "EXIST",
      message: "이메일 주소가 이미 구독 중입니다.",
    });
  }

  try {
    // 이메일을 MongoDB에 저장
    const newEmail = await new Email({ email });
    await newEmail.save();
    res.json({ type: "SUCCESS", message: "이메일 저장 성공" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ type: "ERROR", message: "서버 오류" });
  }
});

// 이메일 삭제 엔드포인트
app.delete("/api/user/unsubscribe/:email", async (req, res) => {
  const { email } = req.params;

  try {
    // 이메일을 MongoDB에서 삭제
    await Email.deleteOne({ email: email });
    res.json({ type: "SUCCESS", message: "이메일 삭제 성공" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ type: "ERROR", message: "서버 오류" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// 매 30분마다 실행
cron.schedule("0/59 * * * * *", () => {
  // RSS 데이터 가져오기
  console.log("[Cron] Fetching RSS data");
  axios
    .get(rssUrl)
    .then((res) => {
      if (res.status === 200) {
        const xmlData = res.data;

        // XML 파싱
        xml2js.parseString(xmlData, async (error, result) => {
          if (error) {
            console.error(error);
            return;
          }

          // <item> 태그 내의 정보 가져오기
          const items = result.rss.channel[0].item.splice(0, 3);
          const message = {};
          let latest = -1;
          // 각 아이템 정보 출력
          for (const item of items) {
            const idx = item.link[0].split("/")[6];
            if (Number(idx) > latest) {
              latest = Number(idx);
            }

            const images = await scrapeImages(item.link[0]);
            console.log(images);
            message[idx] = {
              title: item.title[0],
              images: images,
              link: item.link[0],
              pubDate: item.pubDate[0],
            };
          }
          console.log(message);
          sendEmail(message, latest);
        });
      } else {
        console.error("[Cron] Failed to fetch RSS data");
      }
    })
    .catch((error) => {
      console.error(error);
    });
});

async function sendEmail(message, latest) {
  Email.find({ latest: { $lt: latest } }, "email latest")
    .then((users) => {
      if (users.length === 0) {
        console.log("[Send] All users are latest");
        return;
      }
      users.forEach((user) => {
        sendEmailFor(user, message);
      });
    })
    .catch((error) => {
      console.log("이메일 조회 오류:", error);
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

async function sendEmailFor(user, message) {
  // 유저 최근 게시물 인덱스보다 큰 게시물만 전송하도록 필터링
  const idxs = Object.keys(message);
  let content = `<h2>[정보컴퓨터공학부] 채용게시판</h2>`;
  let count = 0;
  let latest = Number(user.latest);

  idxs.forEach((idx) => {
    const i = Number(idx);
    if (i > latest) {
      content +=
        "<div style='display: flex; flex-direction: column; align-items: center; text-align: center;'>";
      for (const img of message[i].images) {
        content += `<img src="${img}" alt="image" width="400px" ratio="1.6">`;
      }
      content += `<a href="${message[i].link}">${message[i].title}</a></div><br />`;
      count++;
      latest = i;
    }
  });
  console.log(content);

  // 새로운 게시물이 없으면, return
  if (count === 0) {
    return;
  }

  const mailOptions = {
    from: process.env.GOOGLE_MAIL_USER,
    to: user.email,
    subject: `[정보컴퓨터공학부] New Information(${count})`,
    html: content,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.res}`);
    await Email.updateOne({ email: user.email }, { latest: latest });
    const temp = await Email.findOne({ email: user.email });
    console.log(temp);
  } catch (error) {
    console.error(error);
  }
}
