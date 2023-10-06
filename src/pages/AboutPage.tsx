import { forwardRef } from "react";

const AboutPage = forwardRef<HTMLDivElement>((__, ref) => {
  return (
    <div ref={ref} className="flex justify-center w-auto min-h-screen">
      <div className="flex items-center justify-center w-auto m-10 mt-20 bg-white rounded-lg lg:m-20 lg:flex-row h-3/4">
        <div className="flex flex-col h-auto p-6 text-center">
          <div className="m-6 text-4xl font-bold">About</div>
          <br />
          하루 한 번, 오전 11시.
          <br />
          <br />
          학과 홈페이지의 새 소식을 메일로 전달해드립니다:)
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          학과/게시판 추가 요청 또는 개선사항이 있을 시,
          <br />
          {import.meta.env.VITE_GOOGLE_MAIL_USER_ID}으로 연락주시기 바랍니다!
          <br />
          <br />* 학과명, 학과 홈페이지 링크, 자주 보는 게시판 포함 *<br />
          <br />
        </div>
      </div>
    </div>
  );
});

export default AboutPage;
