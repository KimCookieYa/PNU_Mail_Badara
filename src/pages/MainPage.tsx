import { useState } from "react";
import axios from "axios";

function Main() {
  const [email, setEmail] = useState<string>("");
  const [subscribed, setSubscribed] = useState<boolean>(false);

  const handleSubscribe = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      if (!subscribed) {
        await axios.post("/api/user/subscribe", { email });
        console.log("Email sent and saved to the database");
        setSubscribed(true);
      } else {
        await axios.delete(`/api/user/unsubscribe/${email}`);
        console.log("Email removed from the database");
        setSubscribed(false);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-8 bg-white rounded-lg shadow-lg">
        <h2 className="mb-4 text-2xl font-semibold">
          {subscribed ? "구독 중입니다" : "메일링 서비스 구독"}
        </h2>
        {!subscribed ? (
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
          </div>
        ) : (
          <button
            onClick={handleSubscribe}
            className="px-4 py-2 text-white bg-red-500 rounded-md"
          >
            구독 취소
          </button>
        )}
      </div>
    </div>
  );
}

export default Main;
