import { useEffect, useState, forwardRef } from "react";
import axios from "axios";
import { Response } from "../@types/page";

const HistoryPage = forwardRef<HTMLDivElement>((__, ref) => {
  const [commitHistory, setCommitHistory] = useState<string>("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res: Response = await axios.get("/api/history");
        const tempCommits = res.data.data!.commits!;
        if (tempCommits && tempCommits.length > 0) {
          const result = tempCommits!
            .map((commit) => {
              return `${new Date(
                commit.commit.author.date
              ).toLocaleDateString()}: ${commit.commit.message}\n`;
            })
            .join("");
          setCommitHistory(result);
        }
      } catch (error) {
        console.error("GitHub API 호출 오류:", error);
      }
    };
    fetch();
  }, []);

  return (
    <section
      ref={ref}
      className="flex flex-col items-center justify-center w-full min-h-screen"
    >
      <h1 className="m-10 text-3xl text-white">업데이트 내역</h1>
      <textarea
        readOnly={true}
        style={{ overflowY: "scroll" }}
        className="max-w-[500px]"
        value={commitHistory}
      />
      <p>
        자세한 내역은 github.com/{import.meta.env.VITE_GITHUB_OWNER}/
        {import.meta.env.VITE_GITHUB_REPO}를 참고해주시기 바랍니다:)
      </p>
    </section>
  );
});

export default HistoryPage;
