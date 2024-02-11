import { createBrowserRouter } from "react-router-dom";
import MainPage from "./pages/MainPage";
import ValidationPage from "./pages/ValidationPage";
import PwaPage from "./pages/PwaPage";
import DepartmentScreen from "./pages/DepartmentScreen";
import ScrapScreen from "./pages/ScrapScreen";
import HomeScreen from "./pages/HomeScreen";
import { FaSchool } from "react-icons/fa";
import { BiHome, BiNotepad } from "react-icons/bi";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainPage />,
    index: true,
  },
  {
    path: "/validation/:email",
    element: <ValidationPage />,
  },
  {
    path: "/mobile",
    element: <PwaPage />,
    children: [
      {
        path: "department",
        element: <DepartmentScreen />,
      },
      {
        path: "home",
        element: <HomeScreen />,
        index: true,
      },
      {
        path: "scrap",
        element: <ScrapScreen />,
      },
    ],
  },
]);

export const homeRouterInfoList = [
  "Main",
  "About",
  "Department",
  "Detail",
  "History",
] as const;

export const mobileRouterInfoList = [
  { label: "학과", path: "/department", icon: FaSchool },
  { label: "홈", path: "/home", icon: BiHome },
  { label: "스크랩", path: "/scrap", icon: BiNotepad },
] as const;
