import { useLocation, useNavigate } from "react-router-dom";
import { mobileRouterInfoList } from "../../router";

export default function MobileNavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (url: string) => {
    navigate("/mobile" + url);
  };

  const isCurrentScreen = (path: string) => {
    return location.pathname === "/mobile" + path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex w-full mx-auto bg-white border-t h-fit z-[100]">
      <ul className="flex items-center justify-around w-full text-xs">
        {mobileRouterInfoList.map((routerInfo, index) => {
          return (
            <li
              className="items-center justify-center w-20 py-2 text-center hover:cursor-pointer"
              key={index}
              onClick={() => handleNavigate(routerInfo.path)}
            >
              <routerInfo.icon
                size={24}
                className="mx-auto"
                color={isCurrentScreen(routerInfo.path) ? "black" : "gray"}
              />
              <label>{routerInfo.label}</label>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
