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

export async function scrapeNthImage(url, idx) {
  try {
    const res = await axios.get(url);
    const html = res.data;
    const $ = cheerio.load(html);

    const nthImage = $(`img:nth-child(${idx})`).attr("src");

    if (nthImage && nthImage.includes(".ac.kr")) {
      return [nthImage];
    } else {
      return [];
    }
  } catch (error) {
    console.error("[Scrapping] Failed to fetch image.", error);
    return [];
  }
}
