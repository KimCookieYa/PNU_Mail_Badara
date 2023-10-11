import { useRef } from "react";
import { RouterProvider } from "react-router-dom";

import "./App.css";
import { router } from "./pages/Router";
import Header from "./components/Header";
import AboutPage from "./pages/AboutPage";
import DepartmentPage from "./pages/DepartmentPage";
import DetailPage from "./pages/DetailPage";
import HistoryPage from "./pages/HistoryPage";
import ParticlesBackground from "./components/ParticlesBackground";

function App() {
  const mainRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const departmentRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  const refList = [mainRef, aboutRef, departmentRef, detailRef, historyRef];

  const moveToArtist = (index: number) => {
    refList[index]?.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <>
      <ParticlesBackground />
      <Header moveToArtist={moveToArtist} />
      <div ref={mainRef}>
        <RouterProvider router={router} />
      </div>
      <AboutPage ref={aboutRef} />
      <DepartmentPage ref={departmentRef} />
      <DetailPage ref={detailRef} />
      <HistoryPage ref={historyRef} />
    </>
  );
}

export default App;
