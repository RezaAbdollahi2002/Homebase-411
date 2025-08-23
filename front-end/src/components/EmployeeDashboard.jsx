import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import Message from "./Message";
import EmployeeShiftsDashboard from "./EmployeeShiftsDashboard";
import EmployeeShiftWeeklyReviw from './EmployeeShiftWeeklyReviw';

const EmployeeDashboard = () => {
  const [message, setMessage] = useState(false);
  const [employeeName, setEmployeeName] = useState("Employee");

  // Get employee ID from localStorage
  const employeeId = localStorage.getItem("employee_id");

  useEffect(() => {
    if (!employeeId) return;
    console.log(employeeId);

    axios
      .get("/api/employees/employee-name", { params: { employee_id: employeeId  } })
      .then((res) => {
        setEmployeeName(res.data.first_name);
        console.log(res.data.first_name);
      })
      .catch((err) => console.error(err));
  }, [employeeId]);

  const handleMessageState = (data) => {
    setMessage(data);
  };

  return (
    <div className="bg-gray-200 min-h-screen">
      <Navbar messageState={handleMessageState} />

      <h1 className="md:text-3xl text-xl font-semibold text-center my-3">
        Welcome Back, {employeeName}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
        {/* Left panel: Employee Shifts */}
        <div className="col-span-1 md:col-span-2 bg-white rounded-xl p-4 shadow overflow-auto max-h-[90vh]">
          <EmployeeShiftsDashboard employee_id={employeeId} />
        </div>

        {/* Right panel: Main content + optional Message */}
        <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Main content */}
          <div
            className={`bg-white rounded-xl p-4 shadow ${
              message ? "col-span-2" : "col-span-3"
            }`}
          >
            <EmployeeShiftWeeklyReviw employeeId={employeeId}/>
          </div>

          {/* Message panel */}
          {message && (
            <div className="col-span-1 max-w-[400px] bg-white rounded-xl p-4 shadow">
              <Message />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
