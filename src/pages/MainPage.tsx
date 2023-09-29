import { useEffect, useState } from "react";
import axios from "axios";

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
        console.log(res.data);
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

    axios
      .post("/api/user/subscribe", { email })
      .then((res: Response) => {
        console.log(res.data);
        alert(res.data.message);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleUnsubscribe = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    axios
      .delete(`/api/user/unsubscribe/${email}`)
      .then((res: Response) => {
        console.log(res.data);
        alert(res.data.message);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleSelectedDepartment = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedDepartment(e.target.value);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-8 space-y-2 bg-white rounded-lg shadow-lg">
        <select
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
        <div className="flex space-x-2">
          <input
            type="email"
            placeholder="Email"
            className="flex-grow px-3 py-2 border rounded-md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            onClick={handleSubscribe}
            className="px-4 py-2 text-white bg-blue-500 rounded-md"
          >
            Subscribe
          </button>
          <button
            onClick={handleUnsubscribe}
            className="px-4 py-2 text-white bg-red-500 rounded-md"
          >
            Unsubscribe
          </button>
        </div>
      </div>
    </div>
  );
}

export default Main;
