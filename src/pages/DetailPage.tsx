import gmail3 from "../assets/gmail_screenshot3.jpg";
import gmail4 from "../assets/gmail_screenshot4.jpg";
import { forwardRef, useState, useEffect } from "react";
import axios from "axios";
import CountUp from "react-countup";
import { Response } from "../types/page";

const DetailPage = forwardRef<HTMLDivElement>((__, ref) => {
  const [subscriberCount, setSubscriberCount] = useState<number>(100);

  useEffect(() => {
    const fetch = async () => {
      const res: Response = await axios.get("/api/email/count");
      const { count } = res.data.data!;
      setSubscriberCount(count!);
    };
    fetch();
  });

  return (
    <div
      ref={ref}
      className="flex flex-col items-center justify-center w-auto min-h-screen lg:flex-row "
    >
      <img src={gmail3} alt="gmail3" className="w-1/3 h-3/4" />
      <div className="m-10 text-4xl text-center text-white">
        <h1>구독자 수</h1>
        <CountUp end={subscriberCount} duration={8} enableScrollSpy={true} />
      </div>
      <img src={gmail4} alt="gmail4" className="w-1/3 h-3/4" />
    </div>
  );
});

export default DetailPage;
