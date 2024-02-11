import MobileNavBar from "../components/mobile/MobileNavBar";
import MobileHeader from "../components/mobile/MobileHeader";
import { Outlet } from "react-router-dom";

export default function PwaPage() {
  return (
    <main className="relative w-screen h-screen noscroll">
      <MobileHeader />
      <div className="w-full h-16" />
      <Outlet />
      <MobileNavBar />
    </main>
  );
}
