import axios from "axios";
import xml2js from "xml2js";

import Department from "../models/Department";
import { scrapeNthImage, sendEmail } from "./util";
import { MessageContentType, MessagesType } from "../types/MessageType";

export async function schedulingJobs() {
  console.log("-----------------------------");
  const now = new Date();
  now.setHours(now.getHours() + 9);
  console.log(`[Cron] Fetching RSS data (${now}).`);
  try {
    const temp_departments = await Department.find({});
    const departments = temp_departments.filter((__, index) => {
      return (index + now.getHours() + 14) % 24 === 0;
    });
    if (departments.length === 0) {
      console.log("[Cron] Department is nothing.");
      return;
    }

    for (const department of departments) {
      if (department.boards.length === 0) {
        console.log("[Cron] No RSS data on", department.name);
        return;
      }

      let messages: MessagesType = {};
      console.log("[Cron] Fetching RSS data on", department.name);

      for (const [idx, board] of department.boards.entries()) {
        let rssUrl = department.url + board;
        rssUrl += "/rssList.do?row=5";

        try {
          const res = await axios.get(rssUrl, {
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
            const message: MessageContentType = {};
            let latestPostIndex = -1;

            // print item data.
            for (const item of items) {
              let postIdx = item.link[0].split("/")[6];
              let imageIdx = 1;

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
          };
        }
      }

      await sendEmail(messages, department);

      console.log("[Cron] Finished working on", department.name);
    }

    console.log("[Cron] Finished all working on fetching RSS data.");
  } catch (error) {
    console.log(error);
  }
  console.log("-----------------------------");
}
