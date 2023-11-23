import express, { Request, Response } from "express";
import path from "path";
import cron from "node-cron";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

import UserRouter from "./routes/user";
import DepartmentRouter from "./routes/department";
import EmailRouter from "./routes/email";
import HistoryRouter from "./routes/history";

import { schedulingJobs } from "./utils/job";
import { setMock } from "./utils/mock";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// connect to database and set mock.
setMock();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../../dist")));

// Endpoint: API Routing
app.use("/api/user", UserRouter);
app.use("/api/department", DepartmentRouter);
app.use("/api/email", EmailRouter);
app.use("/api/history", HistoryRouter);

// Endpoint: Client Routing
app.use("*", (__: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../../dist", "index.html"));
});

app.listen(PORT, () => {
  console.log("[Running] Server is running on port", PORT);
});

// cron job at 10:00-20:00 on Korea. 시차 9시간.
cron.schedule("0 1-12 * * 1-6", schedulingJobs);
