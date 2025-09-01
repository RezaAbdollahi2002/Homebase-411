// EmployeeDashboard.js
import { useState, useEffect } from "react";
import axios from "axios";
import Message from "./Message";
import EmployeeShiftsDashboard from "./EmployeeShiftsDashboard";
import EmployeeShiftWeeklyReviw from './EmployeeShiftWeeklyReviw';
import Navbar from "./Navbar";

const EmployeeDashboard = ({ message, setMessage  }) => {
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
    <div className="bg-[#E5E5E5] min-h-screen relative top-0 pt-8">
      <h1 className="md:text-3xl text-xl font-semibold text-center mb-2">
        Welcome Back, {employeeName}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
        {/* Left panel */}
        <div className="col-span-1 md:col-span-4 lg:col-span-2 bg-white rounded-xl p-4 shadow overflow-auto max-h-[90vh]">
          <EmployeeShiftsDashboard employee_id={employeeId} />
        </div>

        {/* Right panel */}
        <div className="col-span-1 md:col-span-4 lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          <div className={`bg-white rounded-xl p-4 shadow ${message ? "col-span-3" : "col-span-3"}`}>
            <EmployeeShiftWeeklyReviw employeeId={employeeId}/>
          </div>
        </div>
      </div>

      {/* Overlay*/}
      {
        
          <>
                
                <div
              className={`absolute top-0 bottom-0 min-h-screen right-0 h-[calc(100%-4rem)] w-[350px] bg-white shadow-xl z-50 p-4 overflow-auto transform transition-transform duration-1000 ease-in-out ${
                message ? "translate-x-0" : "translate-x-full"
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
