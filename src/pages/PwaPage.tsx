import MobileNavBar from "../components/mobile/MobileNavBar";
import MobileHeader from "../components/mobile/mobileHeader";

export default function PwaPage({ children }: { children: JSX.Element }) {
  return (
    <main className="w-screen h-screen bg-gray-100">
      <MobileHeader />
      {children}
      <MobileNavBar />
    </main>
  );
}
