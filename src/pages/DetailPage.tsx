import { forwardRef, useState, useEffect } from "react";
import axios from "axios";
import CountUp from "react-countup";
import { Response } from "../@types/page";

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
    <section
      ref={ref}
      className="flex flex-col items-center justify-center w-auto min-h-screen sm:flex-row "
    >
      <div className="m-10 text-4xl text-center text-white">
        <h1>MailBadara 구독자 수</h1>
        <br />
        <CountUp end={subscriberCount} duration={8} enableScrollSpy={true} />
      </div>
    </section>
  );
});

export default DetailPage;
