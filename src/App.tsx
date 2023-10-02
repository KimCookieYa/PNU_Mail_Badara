import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainPage from "./pages/MainPage";
import ErrorPage from "./pages/ErrorPage";
import ValidationPage from "./pages/ValidationPage";
import ParticlesBackground from "./components/ParticlesBackground";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/validation/:email",
    element: <ValidationPage />,
    errorElement: <ErrorPage />,
  },
]);

function App() {
  return (
    <>
      <ParticlesBackground />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
