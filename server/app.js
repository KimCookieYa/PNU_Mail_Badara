import express from "express";
import path from "path";

const __dirname = path.resolve();
const app = express();
const port = 3000;

// 정적 파일 제공
app.use(express.static(path.join(__dirname, "../dist")));

// 루트 엔드포인트에서 React 앱을 서비스
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist", "index.html"));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
