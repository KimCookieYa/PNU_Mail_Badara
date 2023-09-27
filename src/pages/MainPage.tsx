import { useState } from "react";

function Main() {
  const [email, setEmail] = useState<string>("");
  const [subscribed, setSubscribed] = useState<boolean>(false);

  const handleSubscribe = () => {
    // 여기에서 서버 또는 데이터베이스에 구독 요청을 보내는 로직을 구현할 수 있습니다.
    // 이 예제에서는 간단히 subscribed 상태를 토글합니다.
    setSubscribed(!subscribed);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">
          {subscribed ? "구독 중입니다" : "메일링 서비스 구독"}
        </h2>
        {!subscribed ? (
          <div className="flex space-x-2">
            <input
              type="email"
              placeholder="이메일을 입력하세요"
              className="px-3 py-2 border rounded-md flex-grow"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              onClick={handleSubscribe}
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              구독
            </button>
          </div>
        ) : (
          <button
            onClick={handleSubscribe}
            className="px-4 py-2 bg-red-500 text-white rounded-md"
          >
            구독 취소
          </button>
        )}
      </div>
    </div>
  );
}

export default Main;
