import { forwardRef, useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { DeaprtmentList } from "../types/page";

function MyTable({ data }: { data: DeaprtmentList }) {
  return (
    <a
      href={`https://${data.code}.pusan.ac.kr/${data.code}/index.do`}
      target="_blank"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.8 }}
        className="p-5 m-10 text-white border border-solid rounded-lg shadow-md"
      >
        <h2 className="mb-5 text-xl font-bold ">
          {data.name} ({data.code})
        </h2>
        <table className="w-full border-t border-collapse border-gray-300">
          <thead>
            <tr>
              <th className="px-4 py-2 font-semibold text-left border-b border-gray-300">
                게시판 이름
              </th>
            </tr>
          </thead>
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

const DepartmentPage = forwardRef<HTMLDivElement>((__, ref) => {
  const [departmentBoardList, setDepartmentBoardList] = useState<
    DeaprtmentList[]
  >([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get("/api/department/board");
        if (res.data.type === "SUCCESS") {
          setDepartmentBoardList(res.data.data);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetch();
  });

  return (
    <div
      ref={ref}
      className="flex flex-col items-center justify-center w-auto min-h-screen lg:flex-row "
    >
      <div className="grid grid-cols-1 gap-4 mt-10 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {departmentBoardList.map((departmentBoard) => (
          <MyTable key={departmentBoard.name} data={departmentBoard} />
        ))}
      </div>
    </div>
  );
});

export default DepartmentPage;
