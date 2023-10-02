import { useEffect, useState, useRef } from "react";
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
  const [departmentList, setDepartmentList] = useState<DepartmentList>({
    cse: "정보컴퓨터공학부",
  });
  const [selectedDepartment, setSelectedDepartment] =
    useState<string>("정보컴퓨터공학부");
  const checkboxRef = useRef<HTMLInputElement | null>(null);

  const isChecked = () => {
    if (checkboxRef.current?.checked) {
      return true;
    }
    alert("[Error] 개인정보수집에 동의해주세요.");
    return false;
  };

  const isValidated = (email: string) => {
    if (
      email &&
      email.includes("@") &&
      email.includes(".") &&
      email.split("@")[0].length >= 5
    ) {
      return true;
    }
    alert("[Error] Invalid Email");
    return true;
  };

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

    // Email && Check Validation
    if (!isValidated(email) || !isChecked()) {
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
    if (!isValidated(email)) {
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
    <>
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 lg:flex-row xl:flex-row">
        <Title />
        <div className="flex flex-col mt-24 space-y-2">
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
          <label>
            <input
              ref={checkboxRef}
              type="checkbox"
              name="개인정보수집제공동의"
              value="개인정보수집제공동의"
            />{" "}
            개인정보수집제공동의
          </label>
        </div>
      </div>
    </>
  );
}

export default Main;
