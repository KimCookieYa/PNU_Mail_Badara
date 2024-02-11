import { useRef } from "react";

import Header from "../components/main/Header";
import AboutSection from "../components/main/AboutSection";
import DepartmentSection from "../components/main/DepartmentSection";
import DetailSection from "../components/main/DetailSection";
import HistorySection from "../components/main/HistorySection";
import StarBackground from "../components/main/StartBackground";
import HomeSection from "./HomeSection";

export default function MainPage() {
  const homeRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const departmentRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  const refList = [homeRef, aboutRef, departmentRef, detailRef, historyRef];

  const moveToArtist = (index: number) => {
    refList[index]?.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <>
      <StarBackground />
      <div className="relative w-full h-full">
        <Header moveToArtist={moveToArtist} />
        <HomeSection ref={homeRef} />
        <AboutSection ref={aboutRef} />
        <DepartmentSection ref={departmentRef} />
        <DetailSection ref={detailRef} />
        <HistorySection ref={historyRef} />
      </div>
    </>
  );
}
