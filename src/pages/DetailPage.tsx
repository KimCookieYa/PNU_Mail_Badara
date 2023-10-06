import gmail from "../assets/gmail_screenshot.jpg";
import gmail2 from "../assets/gmail_screenshot2.jpg";
import { forwardRef } from "react";

const DetailPage = forwardRef<HTMLDivElement>((__, ref) => {
  return (
    <div
      ref={ref}
      className="flex flex-col items-center justify-center w-auto h-full lg:flex-row"
    >
      <img src={gmail} alt="gmail" className="max-h-3/4" />
      <img src={gmail2} alt="gmail2" className="max-h-3/4" />
    </div>
  );
});

export default DetailPage;
