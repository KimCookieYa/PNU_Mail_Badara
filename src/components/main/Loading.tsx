import Spinner from "/assets/spinner.gif";

function Loading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center m-12">
      <p className="text-xl font-semibold text-center">잠시만 기다려 주세요.</p>
      <img src={Spinner} alt="spinner" />
    </div>
  );
}

export default Loading;
