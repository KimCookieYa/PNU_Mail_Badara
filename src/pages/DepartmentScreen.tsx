import { useQuery } from "@tanstack/react-query";
import { getDepartmentBoard } from "../apis/department";
import { DeaprtmentList } from "../@types/page";
import { BiStar } from "react-icons/bi";

export default function DepartmentScreen() {
  const { data: departmentBoardList, isLoading } = useQuery({
    queryKey: ["department"],
    queryFn: () => getDepartmentBoard(),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <main className="relative flex flex-col items-center w-full h-full py-2 bg-gray-200">
      {isLoading ? (
        <div>loading</div>
      ) : (
        departmentBoardList?.map((departmentBoard) => (
          <DepartmentCard key={departmentBoard.code} data={departmentBoard} />
        ))
      )}
    </main>
  );
}

function DepartmentCard({ data }: { data: DeaprtmentList }) {
  return (
    <article className="relative flex w-full p-4 text-lg bg-white border-b">
      <div className="flex flex-col">
        <h1>{data.name}</h1>
        <p className="text-xs text-gray-400">{data.board_names.join(", ")}</p>
      </div>
      <BiStar className="absolute top-0 bottom-0 m-auto right-4" />
    </article>
  );
}
