import { useEffect, useState } from "react";
import axios from "axios";

import { useLocalStorage } from "../hooks/useLocalStorage";
import { Department } from "../@types/page";
import { Content } from "../@types/content";

export default function HomeScreen() {
  const { value: departmentList } = useLocalStorage<Department[]>(
    "department-list",
    []
  );

  const [postList, setPostList] = useState<Content[]>([]);
  useEffect(() => {
    const fetch = async () => {
      const tempList = [];
      for (const department of departmentList) {
        for (const board of department.boards) {
          const res = await axios({
            method: "get",
            url: `https://${department.code}.pusan.ac.kr/bbs/${department.code}/${board}/rssList.do?row=50`,
          });
          tempList.push(...res.data.data);
        }
      }
      setPostList(tempList);
    };
    console.log(departmentList);
    fetch();
  }, [departmentList]);

  return (
    <main className="relative flex flex-col items-center w-full h-full py-2 bg-gray-200">
      {departmentList ? (
        postList.map((post, index) => (
          <div
            key={"post" + index}
            className="p-5 m-10 text-black border sm:w-[300px] w-[280px] h-[300px] overflow-y-scroll"
          >
            {post.title}
          </div>
        ))
      ) : (
        <div>loading</div>
      )}
    </main>
  );
}
