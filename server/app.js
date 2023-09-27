import express from "express";
import path from "path";
import cron from "node-cron";
import axios from "axios";
import xml2js from "xml2js";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import mongoose from "mongoose";

dotenv.config();

const rssUrl = "https://cse.pusan.ac.kr/bbs/cse/2616/rssList.do?row=50";

const __dirname = path.resolve();
const app = express();
const port = 3000;

// 정적 파일 제공
app.use(express.static(path.join(__dirname, "../dist")));

// 루트 엔드포인트에서 React 앱을 서비스
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist", "index.html"));
});

app.post("/api/user/subscribe", (req, res) => {});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// 매 30분마다 실행
cron.schedule("*/30 * * * * *", () => {
  // 게시글 크롤링 및 DB에 저장하는 로직을 여기에 추가

  // RSS 데이터 가져오기
  axios
    .get(rssUrl)
    .then((response) => {
      if (response.status === 200) {
        const xmlData = response.data;

        // XML 파싱
        xml2js.parseString(xmlData, (err, result) => {
          if (err) {
            console.error(err);
            return;
          }

          // <item> 태그 내의 정보 가져오기
          const items = result.rss.channel[0].item.splice(0, 3);

          // 각 아이템 정보 출력
          items.forEach((item) => {
            console.log("Title:", item.title[0]);
            console.log("Link:", item.link[0]);
            console.log("Description:", item.description[0]);
            console.log("Publication Date:", item.pubDate[0]);
            console.log("-----------------------------");
          });
          // sendEmail("min49590@naver.com", items.toString());
        });
      } else {
        console.error("Failed to fetch RSS data");
      }
    })
    .catch((error) => {
      console.error(error);
    });
});

async function sendEmail(userEmail, message) {
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
  console.log(
    process.env.GOOGLE_MAIL_USER,
    process.env.GOOGLE_MAIL_APP_PASSWORD
  );

  const mailOptions = {
    from: process.env.GOOGLE_MAIL_USER,
    to: userEmail,
    subject: "New Announcement",
    text: message,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.response}`);
  } catch (error) {
    console.error(error);
  } finally {
    transporter.close();
  }
}
