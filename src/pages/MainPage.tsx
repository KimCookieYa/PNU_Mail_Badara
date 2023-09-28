import { useState } from "react";
import axios from "axios";

type Response = {
  data: {
    type: string;
    message: string;
  };
};

function Main() {
  const [email, setEmail] = useState<string>("");

  const handleSubscribe = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // Email Validation
    if (
      !email ||
      !email.includes("@") ||
      !email.includes(".") ||
      email.split("@")[0].length < 5
    ) {
      alert("이메일 형식이 올바르지 않습니다.");
      return;
    }

    try {
      axios.post("/api/user/subscribe", { email }).then((res: Response) => {
        console.log(res.data);
        alert(res.data.message);
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleUnsubscribe = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    try {
      axios.delete(`/api/user/unsubscribe/${email}`).then((res: Response) => {
        console.log(res.data);
        alert(res.data.message);
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-8 bg-white rounded-lg shadow-lg">
        <h2 className="mb-4 text-2xl font-semibold">PNU Mail Badara</h2>
        <div className="flex space-x-2">
          <input
            type="email"
            placeholder="이메일을 입력하세요"
            className="flex-grow px-3 py-2 border rounded-md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            onClick={handleSubscribe}
            className="px-4 py-2 text-white bg-blue-500 rounded-md"
          >
            구독
          </button>
          <button
            onClick={handleUnsubscribe}
            className="px-4 py-2 text-white bg-red-500 rounded-md"
          >
            구독 취소
          </button>
        </div>
      </div>
    </div>
  );
}

export default Main;
