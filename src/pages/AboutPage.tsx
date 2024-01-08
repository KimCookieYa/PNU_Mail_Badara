import { forwardRef } from "react";

const AboutPage = forwardRef<HTMLDivElement>((__, ref) => {
  return (
    <section ref={ref} className="flex justify-center w-full min-h-screen">
      <div className="flex items-center justify-center w-full m-0 mt-20 bg-white sm:flex-row">
        <div className="flex flex-col h-auto gap-16 p-6 text-center">
          <p className="m-6 text-3xl font-bold sm:text-5xl">MailBadara</p>

          <p className="p-4 text-2xl italic text-white bg-[#050d19]">
            하루에 한 번, <br />
            학과 게시판 소식을 뉴스레터로 보내드립니다.
          </p>
          <p>
            저는 부산대학교 전기컴퓨터공학부 정보컴퓨터공학전공 18학번
            김민석이라고 합니다. <br />
            평소 학과 홈페이지의 게시판을 자주 뒤졌었는데 이게 너무 불편해서
            직접 개발했습니다. <br />
            타과생, 타학교 학생들도 쓸 수 있게끔 설계하였습니다. 디자인은
            갖다버리고 기능에만 집중하였습니다.
            <br />이 서비스가 도움이 되었으면 좋겠습니다:) 많이 쓰일수록 포폴로
            쓰기 좋거든요.
          </p>
          <p>
            학과/게시판 추가 요청 또는 개선사항이 있을 시,
            <br />
            {import.meta.env.VITE_GOOGLE_MAIL_USER_ID}으로 연락주시기 바랍니다.
          </p>
          <br />
        </div>
      </div>
    </section>
  );
});

export default AboutPage;
