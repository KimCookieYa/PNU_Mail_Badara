import { useQuery } from "@tanstack/react-query";
import { getDepartmentBoard } from "../apis/department";
import { Department } from "../@types/page";
import { BiStar } from "react-icons/bi";
import { useLocalStorage } from "../hooks/useLocalStorage";

export default function DepartmentScreen() {
  const { data: departmentBoardList, isLoading } = useQuery({
    queryKey: ["department"],
    queryFn: () => getDepartmentBoard(),
    staleTime: 1000 * 60 * 5,
  });

  const { value: departmentList, setValue: setDepartmentList } =
    useLocalStorage<Department[]>("department-list", []);

  const handleClickStar = (data: Department) => {
    setDepartmentList((prevState) => {
      const current = prevState.findIndex(
        (department) => department.code === data.code
      );
      if (current === -1) {
        return [...prevState, data];
      } else {
        return [
          ...prevState.slice(0, current),
          ...prevState.slice(current + 1),
        ];
      }
    });
  };

  const isStarred = (department: Department) => {
    return departmentList.some((data) => data.code === department.code);
  };

  return (
    <main className="relative flex flex-col items-center w-full h-full py-2 bg-gray-100">
      {isLoading ? (
        <div>loading</div>
      ) : (
        departmentBoardList?.map((departmentBoard) => (
          <DepartmentCard
            key={departmentBoard.code}
            data={departmentBoard}
            handleClick={handleClickStar}
            starred={isStarred(departmentBoard)}
          />
        ))
      )}
    </main>
  );
}

function DepartmentCard({
  data,
  handleClick,
  starred,
}: {
  data: Department;
  handleClick: (data: Department) => void;
  starred: boolean;
}) {
  return (
    <article className="relative flex w-full p-4 text-lg bg-white border-b">
      <div className="flex flex-col">
        <h1>{data.name}</h1>
        <p className="text-xs text-gray-400">{data.board_names.join(", ")}</p>
      </div>
      <BiStar
        className="absolute top-0 bottom-0 m-auto right-4"
        onClick={() => handleClick(data)}
        color={starred ? "orange" : "gray"}
      />
    </article>
  );
}
