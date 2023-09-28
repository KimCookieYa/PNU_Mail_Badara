import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeImages(url) {
  try {
    const res = await axios.get(url);
    const html = res.data;
    const $ = cheerio.load(html);

    const images = [];
    $("img").each((index, element) => {
      const src = $(element).attr("src");
      if (src) {
        images.push(src);
      }
    });
    return images;
  } catch (error) {
    console.error(error);
    return [];
  }
}
