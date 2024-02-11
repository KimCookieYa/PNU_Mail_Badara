import axios from "axios";
import { Deaprtment } from "../@types/page";

export async function getDepartmentBoard(): Promise<Deaprtment[]> {
  try {
    const res = await axios.get("http://localhost:8000/api/department/board");
    if (res.data.type === "SUCCESS") {
      return res.data.data;
    } else {
      throw new Error(res.data.message);
    }
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}
