// EmployeeDashboard.js
import { useState, useEffect } from "react";
import axios from "axios";
import Message from "./Message";
import EmployeeShiftsDashboard from "./EmployeeShiftsDashboard";
import EmployeeShiftWeeklyReviw from './EmployeeShiftWeeklyReviw';
import Navbar from "./Navbar";
import EmployeeAnnouncement from "./EmployeeAnnouncement";
import ElectricBorder from "./Animations/ElectricBorder";



const EmployeeDashboard = ({ message, setMessage }) => {
  const [employeeName, setEmployeeName] = useState("Employee");
  const employeeId = localStorage.getItem("employee_id");


  useEffect(() => {
    if (!employeeId) return;
    axios
      .get("/api/employees/employee-name", { params: { employee_id: employeeId } })
      .then((res) => setEmployeeName(res.data.first_name))
      .catch((err) => console.error(err));
  }, [employeeId]);

  return (
    <div className="bg-black min-h-screen relative top-0 pt-8">
      <h1 className="md:text-3xl text-xl font-semibold text-center mb-2 text-white">
        Welcome Back, {employeeName}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
        {/* Left panel */}
        <ElectricBorder
          color="white"
          speed={1}
          chaos={0.5}
          thickness={2}
          style={{ borderRadius: 16 }}
          className="col-span-1 md:col-span-4 lg:col-span-2"
        >
          <div className="bg-transparent rounded-xl p-4 shadow overflow-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-3 mx-4 text-white">Announcements</h2>
            <div className="px-6">
              < EmployeeAnnouncement />
            </div>
            <EmployeeShiftsDashboard employee_id={employeeId} />
          </div>
        </ElectricBorder>

        {/* Right panel */}

        {/* Right panel */}
        <ElectricBorder
          color="white"
          speed={1}
          chaos={0.5}
          thickness={2}
          style={{ borderRadius: 16 }}
          className="col-span-1 md:col-span-4 lg:col-span-2"
        >
          <div className="bg-transparent rounded-xl p-4 shadow h-full">
            <EmployeeShiftWeeklyReviw employeeId={employeeId} />
          </div>
        </ElectricBorder>

      </div>

      {/* Overlay*/}
      {

        <>

          <div
            className={`absolute top-0 bottom-0 min-h-screen right-0 h-[calc(100%-4rem)] w-[350px] bg-white shadow-xl z-50 p-4 overflow-auto transform transition-transform duration-1000 ease-in-out ${message ? "translate-x-0" : "translate-x-full"
              }`}
          >
            <Message onClose={() => setMessage(false)} />
          </div>
        </>

      }



    </div>
  );
};

export default EmployeeDashboard;
