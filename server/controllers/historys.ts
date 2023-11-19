import axios from "axios";
import { RequestHandler } from "express";

export const getDevHistorys: RequestHandler = async (__, res) => {
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
};
