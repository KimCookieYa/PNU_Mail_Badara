import { useEffect, useState } from "react";
import axios from "axios";
import Title from "../components/Title";

type Response = {
  data: {
    type: string;
    message: string;
    data?: object;
  };
};

type DepartmentList = {
  [key: string]: string;
};

function Main() {
  const [email, setEmail] = useState<string>("");
  const [departmentList, setDepartmentList] = useState<DepartmentList>({});
  const [selectedDepartment, setSelectedDepartment] =
    useState<string>("정보컴퓨터공학부");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get("/api/department");
        setDepartmentList(res.data.data);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetch();
  }, []);

  const handleSubscribe = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // Email Validation
    if (
      !email ||
      !email.includes("@") ||
      !email.includes(".") ||
      email.split("@")[0].length < 5
    ) {
      alert("[Error] Invalid Email");
      return;
    }

    const selectedDepartmentCode = Object.keys(departmentList).filter(
      (key) => departmentList[key] === selectedDepartment
    )[0];

    axios
      .post("/api/user/subscribe", {
        email,
        department: selectedDepartmentCode,
      })
      .then((res: Response) => {
        alert(`${res.data.type}: ${res.data.message}`);
      })
      .catch((error) => {
        console.error("ERROR:", error);
      });
  };

  const handleUnsubscribe = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // Email Validation
    if (
      !email ||
      !email.includes("@") ||
      !email.includes(".") ||
      email.split("@")[0].length < 5
    ) {
      alert("[Error] Invalid Email");
      return;
    }

    axios
      .delete(`/api/user/unsubscribe/${email}`)
      .then((res: Response) => {
        alert(`${res.data.type}: ${res.data.message}`);
      })
      .catch((error) => {
        console.error("ERROR:", error);
      });
  };

  const handleSelectedDepartment = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedDepartment(e.target.value);
  };

  return (
    <div className="flex items-center justify-center min-h-screen gap-4">
      <Title />
      <div className="space-y-2">
        <div className="flex flex-col space-y-2">
          <select
            className="border border-black "
            value={departmentList[selectedDepartment]}
            onChange={handleSelectedDepartment}
          >
            {Object.keys(departmentList).map((key) => {
              return (
                <option key={key} value={departmentList[key]}>
                  {departmentList[key]}
                </option>
              );
            })}
          </select>
          <input
            type="email"
            placeholder="Email"
            className="flex-grow px-3 py-2 border border-gray-300 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleSubscribe}
            className="px-4 py-2 text-white bg-black"
          >
            Subscribe
          </button>
          <button
            onClick={handleUnsubscribe}
            className="px-4 py-2 text-white bg-gray-500"
          >
            Unsubscribe
          </button>
        </div>
      </div>
    </div>
  );
}

export default Main;
