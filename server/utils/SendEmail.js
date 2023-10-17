import nodemailer from "nodemailer";
import User from "../models/User.js";
import { stringToDate } from "./Utils.js";

// send email for all in department.
export async function sendEmail(messages, department) {
  console.log(`Sending email for All in ${department.name}...`);

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

  const users = await User.find(query);
  if (users.length === 0) {
    console.log(`All users of ${department.name} are latest.`);
    return;
  }

  try {
    for (const user of users) {
      await sendEmailFor(user, messages, department);
    }
  } catch (error) {
    console.log(error);
  }
}

// send email for one user.
async function sendEmailFor(user, messages, department) {
  let count = 0;
  let boardIdx = 0;
  let content = "";
  const boardNames = Object.keys(messages);
  const updatedLatestPostIndexs = [];

  let startDate = null;
  let endDate = null;

  for (const boardName of boardNames) {
    const message = messages[boardName];
    const postIdxs = Object.keys(message.message);
    updatedLatestPostIndexs.push(
      message.latestPostIndex === -1
        ? user.latest_post_indexs[boardIdx]
        : message.latestPostIndex
    );

    let tempContent = "";
    let pastPostIndexs = user.latest_post_indexs;

    for (const postIdx of postIdxs) {
      const postIndex = Number(postIdx);
      if (postIndex > pastPostIndexs[boardIdx]) {
        const tempDate = department.code.includes("snu")
          ? new Date(message.message[postIdx].pubDate)
          : stringToDate(message.message[postIdx].pubDate);
        if (startDate === null || startDate > tempDate) {
          startDate = tempDate;
        }

        if (endDate === null || endDate < tempDate) {
          endDate = tempDate;
        }

        tempContent += `<div style='margin: 10px'>
                        <p>제목:
                          <a href="${message.message[postIndex].link}">
                            ${message.message[postIndex].title}
                          </a>
                          <br />
                          게시일: ${message.message[postIndex].pubDate}
                        </p>
                      </div>`;
        for (const img of message.message[postIndex].images) {
          tempContent += `<div style="width: 60vw; height: 85vw; overflow: hidden; max-width: 700px; max-height: 990px">
                            <img src="${img}" alt="image" style="width: 60vw; height: auto; max-width: 700px; max-height: none;">
                          </div>`;
        }
        count++;
      }
    }

    boardIdx++;
    if (tempContent === "") {
      continue;
    }

    content +=
      `<br /><br />
      <h1>[${department.name}] ${boardName}</h1>
      <div style="background-color: black; width: 40vw; height: 3px"/>` +
      tempContent;
  }
  content =
    "" +
    content +
    `</br></br></br>
    <div style="background-color: black; width: 70vw; height: 3px"/>
    <div style="text-align: center; margin: 20px">
      <a href="${
        process.env.NODE_ENV === "production"
          ? process.env.PRODUCTION_URL
          : process.env.DEVELOPMENT_URL
      }">Unsubscribe</a>
    </div>`;

  // if there is no new post, return.
  if (count === 0 || startDate === undefined || endDate === undefined) {
    return;
  }

  let dateString = "";

  if (startDate !== null && endDate !== null) {
    dateString =
      startDate.getMonth() === endDate.getMonth() &&
      startDate.getDate() === endDate.getDate()
        ? `[${endDate.getFullYear()}-${
            endDate.getMonth() + 1
          }-${endDate.getDate()}]`
        : `[${startDate.getFullYear()}-${
            startDate.getMonth() + 1
          }-${startDate.getDate()} ~ ${endDate.getFullYear()}-${
            endDate.getMonth() + 1
          }-${endDate.getDate()}]`;
  }

  const mailOptions = {
    from: process.env.APP_TITLE,
    to: user.email,
    subject: `[${process.env.APP_TITLE}]${dateString} ${department.name}에서 ${count}개의 새 소식이 왔습니다!`,
    html: content,
  };

  // create email transporter.
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.GOOGLE_MAIL_USER_ID,
      pass: process.env.GOOGLE_MAIL_APP_PASSWORD,
    },
  });

  try {
    await transporter.sendMail(mailOptions);
    console.log("[Success] Send email to", user.email);
    await User.updateOne(
      { email: user.email },
      { latest_post_indexs: updatedLatestPostIndexs }
    );
  } catch (error) {
    console.error(error);
  }
}

// send email validation.
export async function sendEmailValidation(email) {
  const mailOptions = {
    from: process.env.APP_TITLE,
    to: email,
    subject: `[${process.env.APP_TITLE}] 이메일 검증 안내`,
    html: `<div style="gap: 10px">
                다음 버튼을 눌러 최종적으로 메일을 검증해주시기 바랍니다.
                </br>
                <a href="${
                  process.env.NODE_ENV === "production"
                    ? process.env.PRODUCTION_URL
                    : process.env.DEVELOPMENT_URL
                }/api/user/validation/${email}">
                  <button>Validate</button>
                </a>
              </div>`,
  };

  // create email transporter.
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.GOOGLE_MAIL_USER_ID,
      pass: process.env.GOOGLE_MAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail(mailOptions);
}

// send subscrition success email.
export async function sendSubscritionSuccessEmail(email, department_name) {
  const mailOptions = {
    from: process.env.APP_TITLE,
    to: email,
    subject: `[${process.env.APP_TITLE}] 구독 완료`,
    html: `<p>
      ${email}님의 ${department_name} 구독이 성공적으로 완료되었습니다:)<br/>
      MailBadara 서비스를 구독해주셔서 감사드립니다:)<br/>
      구독 취소는 아래 버튼을 눌러 진행하실 수 있습니다.
      <hr>
    </p>
    <div style="text-align: center; margin: 20px">
      <a href="${
        process.env.NODE_ENV === "production"
          ? process.env.PRODUCTION_URL
          : process.env.DEVELOPMENT_URL
      }">Unsubscribe</a>
    </div>`,
  };

  // create email transporter.
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.GOOGLE_MAIL_USER_ID,
      pass: process.env.GOOGLE_MAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail(mailOptions);
}
