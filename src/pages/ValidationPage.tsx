import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

import { isValid } from "../utils/Email";
import { Response } from "../@types/page";

function ValidationPage() {
  const { email } = useParams();
  const [valid, setValid] = useState<boolean>(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res: Response = await axios.get("/api/email/existence", {
          params: { email },
        });
        const { exist } = res.data.data!;
        setValid(exist! && isValid(email!));
      } catch (error) {
        console.error(error);
      }
    };
    fetch();
  }, [email]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-9/12 p-8 space-y-2 text-center bg-white rounded-lg shadow-lg">
        {valid ? (
          <p>
            {email}에 대한 검증이 완료되었습니다! 구독을 취소하시려면,{" "}
            <Link to="/" className="text-blue-500 underline">
              Home
            </Link>
            으로 이동하시기 바랍니다:)
          </p>
        ) : (
          <p>
            Permission Denied. Go to the{" "}
            <Link to="/" className="text-blue-500 underline">
              Home
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}

export default ValidationPage;
