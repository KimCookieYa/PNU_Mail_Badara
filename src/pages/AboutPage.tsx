import { forwardRef } from "react";

const AboutPage = forwardRef<HTMLDivElement>((__, ref) => {
  return (
    <div ref={ref} className="flex justify-center w-auto min-h-screen">
      <div className="flex items-center justify-center w-auto m-10 mt-20 bg-white rounded-lg lg:m-20 lg:w-1/2 lg:flex-row h-3/4">
        <div className="flex flex-col h-auto p-6 text-center">
          <div className="m-6 text-4xl font-bold">Mail Badara</div>
          <br />
          <div className="text-2xl italic text-gray-500">
            하루 두 번, 오전 11시, 오후 6시.
            <br />
            <br />
            학과의 새 소식을 메일로 전달해드립니다:)
          </div>
          <br />
          <br />
          저는 부산대학교 전기컴퓨터공학부 정보컴퓨터공학전공 18학번
          김민석이라고 합니다. 평소 학과 홈페이지의 게시판을 자주 뒤졌었는데
          이게 너무 불편해서 직접 개발했습니다. 타과생, 타학교 학생들도 쓸 수
          있게끔 설계하였습니다. 디자인은 갖다버리고 기능에만 집중하였습니다. 이
          서비스가 도움이 되었으면 좋겠습니다:) 많이 쓰일수록 포폴로 쓰기
          좋거든요.
          <br />
          <br />
          <br />
          <br />
          학과/게시판 추가 요청 또는 개선사항이 있을 시,{" "}
          {import.meta.env.VITE_GOOGLE_MAIL_USER_ID}으로 연락주시기 바랍니다!
          그리고 학과 홈페이지에서 rss를 제공하지 않을 시, 추가되는데에 시간이
          소요됩니다.
          <br />
          <br />* 학과명, 학과 홈페이지 링크, 자주 보는 게시판 포함 *<br />
          <br />
        </div>
      </div>
    </div>
  );
});

export default AboutPage;
