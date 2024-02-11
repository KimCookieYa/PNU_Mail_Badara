import { forwardRef } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

import { SwiperSlide, Swiper } from "swiper/react";
import { EffectFade, EffectCube } from "swiper/modules";
import {
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Autoplay,
} from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import "swiper/css/zoom";
import "swiper/css/virtual";

import { getDepartmentBoard } from "../../apis/department";
import { DeaprtmentList } from "../../@types/page";

function DepartmentBoard({ data }: { data: DeaprtmentList }) {
  return (
    <a
      href={`https://${data.code}.pusan.ac.kr/${data.code}/index.do`}
      target="_blank"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.8 }}
        className="p-5 m-10 text-white border sm:w-[300px] w-[280px] h-[300px] overflow-y-scroll swiper-box"
      >
        <h2 className="mb-5 text-xl font-bold">
          {data.name} ({data.code})
        </h2>
        <table className="w-full border-t border-collapse border-gray-300 h-fit">
          <tbody>
            {data.board_names.map((boardName) => (
              <tr
                key={boardName}
                className="transition-colors duration-200 hover:bg-gray-100"
              >
                <td className="px-4 py-2 border-b border-gray-300">
                  {boardName}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </a>
  );
}

const DepartmentSection = forwardRef<HTMLDivElement>((__, ref) => {
  const { data: departmentBoardList, isLoading } = useQuery({
    queryKey: ["department"],
    queryFn: getDepartmentBoard,
  });

  return (
    <section
      ref={ref}
      className="flex flex-col items-center justify-center w-full min-h-screen"
    >
      {!isLoading ? (
        <>
          <Swiper
            modules={[
              Navigation,
              Pagination,
              Scrollbar,
              A11y,
              Autoplay,
              EffectFade,
              EffectCube,
            ]}
            navigation
            pagination={{ clickable: true }}
            scrollbar={{ draggable: true }}
            onSwiper={(swiper) => console.log(swiper)}
            onSlideChange={() => console.log("slide change")}
            autoplay={{ delay: 2000, disableOnInteraction: false }}
            effect="slide"
            className="w-full sm:w-3/4"
            centeredSlides
            slidesPerView={1}
            spaceBetween={10}
            breakpoints={{
              320: {
                slidesPerView: 1,
                spaceBetween: 20,
              },
              480: {
                slidesPerView: 2,
                spaceBetween: 30,
              },
              640: {
                slidesPerView: 3,
                spaceBetween: 50,
              },
            }}
          >
            {departmentBoardList?.map((data) => (
              <SwiperSlide
                key={data.code}
                className="flex items-center justify-center"
              >
                <DepartmentBoard data={data} />
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="text-xl font-bold text-center text-white animate-scale-up-down">
            ⬆️Click me to see more⬆️
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </section>
  );
});

export default DepartmentSection;
