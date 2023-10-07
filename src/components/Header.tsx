import { Outlet } from "react-router-dom";
import Title from "./Title";
import { routerInfoList } from "../pages/Router";

function Header({ moveToArtist }: { moveToArtist: (index: number) => void }) {
  return (
    <>
      <div className="fixed flex items-center justify-between w-full h-20">
        <Title onClick={() => moveToArtist(0)} />
        <div>
          <ul className="flex mr-8 text-white gap-x-6">
            {routerInfoList.map((routerInfo, index) => {
              return (
                <li
                  className="hover:cursor-pointer"
                  key={index}
                  onClick={() => moveToArtist(index)}
                >
                  {routerInfo}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <Outlet />
    </>
  );
}

export default Header;
