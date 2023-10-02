import User from "../models/User.js";

// send email for all in department.
export async function sendEmail(transporter, messages, department) {
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

  await User.find(query)
    .then((users) => {
      if (users.length === 0) {
        console.log(`All users of ${department.name} are latest.`);
        return;
      }
      users.forEach((user) => {
        sendEmailFor(transporter, user, messages, department);
      });
    })
    .catch((error) => {
      console.log(error);
    });
}

// send email for one user.
async function sendEmailFor(transporter, user, messages, department) {
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

  // if there is no new post, return.
  if (count === 0) {
    return;
  }

  const mailOptions = {
    from: process.env.APP_TITLE,
    to: user.email,
    subject: `[${process.env.APP_TITLE}] ${department.name}에서 ${count}개의 새 소식이 왔습니다!`,
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

// send email validation.
export async function sendEmailValidation(transporter, email) {
  const mailOptions = {
    from: process.env.APP_TITLE,
    to: email,
    subject: `[${process.env.APP_TITLE}] 이메일 검증 안내`,
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

  await transporter.sendMail(mailOptions);
}
