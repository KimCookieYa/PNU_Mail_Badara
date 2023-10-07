import gmail3 from "../assets/gmail_screenshot3.jpg";
import gmail4 from "../assets/gmail_screenshot4.jpg";
import { forwardRef } from "react";

const DetailPage = forwardRef<HTMLDivElement>((__, ref) => {
  return (
    <div
      ref={ref}
      className="flex flex-col items-center justify-center w-auto h-full lg:flex-row"
    >
      <img src={gmail3} alt="gmail3" className="max-h-3/4" />
      <img src={gmail4} alt="gmail4" className="max-h-3/4" />
    </div>
  );
});

export default DetailPage;
