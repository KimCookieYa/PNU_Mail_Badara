import { useRef } from "react";
import { RouterProvider } from "react-router-dom";

import "./App.css";
import { router } from "./pages/Router";
import Header from "./components/main/Header";
import AboutSection from "./components/main/AboutSection";
import DepartmentSection from "./components/main/DepartmentSection";
import DetailSection from "./components/main/DetailSection";
import HistorySection from "./components/main/HistorySection";

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
    <div className="relative w-full h-full">
      <Header moveToArtist={moveToArtist} />
      <main ref={mainRef}>
        <RouterProvider router={router} />
      </main>
      <AboutSection ref={aboutRef} />
      <DepartmentSection ref={departmentRef} />
      <DetailSection ref={detailRef} />
      <HistorySection ref={historyRef} />
    </div>
  );
}

export default App;
