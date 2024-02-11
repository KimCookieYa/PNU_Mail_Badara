import { Outlet } from "react-router-dom";
import Title from "./Title";
import { routerInfoList } from "../../pages/Router";

function Header({ moveToArtist }: { moveToArtist: (index: number) => void }) {
  return (
    <>
      <header className="fixed flex items-center justify-between w-full h-12 bg-transparent">
        <Title onClick={() => moveToArtist(0)} />
        <nav className="hidden md:flex">
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
        </nav>
      </header>
      <Outlet />
    </>
  );
}

export default Header;
