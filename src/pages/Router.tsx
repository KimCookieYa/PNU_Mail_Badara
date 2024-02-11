import { createBrowserRouter } from "react-router-dom";
import MainPage from "../pages/MainPage";
import ValidationPage from "../pages/ValidationPage";
import PwaPage from "./PwaPage";

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
  },
]);

export const routerInfoList = [
  "Main",
  "About",
  "Department",
  "Detail",
  "History",
];
