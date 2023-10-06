import { createBrowserRouter } from "react-router-dom";
import MainPage from "../pages/MainPage";
import ValidationPage from "../pages/ValidationPage";

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
]);

export const routerInfoList = ["Main", "About", "Detail"];
