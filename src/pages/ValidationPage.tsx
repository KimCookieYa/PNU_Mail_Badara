import { Link, useParams } from "react-router-dom";

export default function ValidationPage() {
  const { email } = useParams();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-8 space-y-2 bg-white rounded-lg shadow-lg">
        <p>
          {email}에 대한 검증이 완료되었습니다! 구독을 취소하시려면,{" "}
          <Link to="/" className="text-blue-500 underline">
            홈
          </Link>
          으로 이동해서 구독을 취소하시기 바랍니다.
        </p>
      </div>
    </div>
  );
}
