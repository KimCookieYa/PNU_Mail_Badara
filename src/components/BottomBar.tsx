import "../App.css";

function BottomBar() {
  return (
    <>
      <div className="absolute bottom-0 left-0 w-full p-4 text-center opacity-80">
        학과/게시판 추가 요청 또는 개선사항이 있을 시,{" "}
        {import.meta.env.VITE_GOOGLE_MAIL_USER_ID}으로 연락주시기 바랍니다:)
        <br />* 학과명, 학과 홈페이지 링크, 자주 보는 게시판 포함 *
      </div>
    </>
  );
}

export default BottomBar;
