import { IoIosNotificationsOutline } from "react-icons/io";

export default function MobileHeader() {
  return (
    <>
      <header className="fixed flex items-center w-full p-3 bg-white h-fit gap-x-4 z-[100]">
        <h1>M</h1>
        <input
          placeholder="학과를 입력하세요"
          className="w-full px-3 py-2 bg-gray-100 rounded-full focus:outline-none"
        />
        <IoIosNotificationsOutline size={30} />
      </header>
    </>
  );
}
