import { Link, useParams } from "react-router-dom";
import { isValid } from "../utils/Email";

export default function ValidationPage() {
  const { email } = useParams();

  // TODO: email이 db에 존재하는지 체크.

  return (
    <>
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-9/12 p-8 space-y-2 text-center bg-white rounded-lg shadow-lg">
          {!isValid(email!) ? (
            <p>
              Permission Denied. Go to the{" "}
              <Link to="/" className="text-blue-500 underline">
                Home
              </Link>
              .
            </p>
          ) : (
            <p>
              {email}에 대한 검증이 완료되었습니다! 구독을 취소하시려면,{" "}
              <Link to="/" className="text-blue-500 underline">
                Home
              </Link>
              으로 이동하시기 바랍니다:)
            </p>
          )}
        </div>
      </div>
    </>
  );
}
