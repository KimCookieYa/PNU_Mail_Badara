import { useRef } from "react";
import { RouterProvider } from "react-router-dom";

import "./App.css";
import { router } from "./pages/Router";
import AboutPage from "./pages/AboutPage";
import Header from "./components/Header";
import ParticlesBackground from "./components/ParticlesBackground";
import DetailPage from "./pages/DetailPage";
import HistoryPage from "./pages/HistoryPage";

function App() {
  const mainRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  const refList = [mainRef, aboutRef, detailRef, historyRef];

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
      <DetailPage ref={detailRef} />
      <HistoryPage ref={historyRef} />
    </>
  );
}

export default App;
