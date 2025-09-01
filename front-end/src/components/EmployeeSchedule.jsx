// EmployeeSchedule.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Navbar from "./Navbar";
import Message from "./Message";

const EmployeeSchedule = ({ message, handleMessageState, setMessage }) => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const employeeId = localStorage.getItem("employee_id");

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/shifts/employee`, {
        params: { employee_id: employeeId },
      })
      .then((res) => {
        setShifts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || "Failed to load shifts");
        setLoading(false);
      });
  }, [employeeId]);

  const events = shifts.map((shift) => ({
    id: shift.id,
    title: `${shift.role} - ${shift.title}`, // fallback for FullCalendar
    start: new Date(shift.start_time),
    end: new Date(shift.end_time),
    backgroundColor: shift.role === "Supervisor" ? "#5E7B94" : "#5E141E",
    extendedProps: {
      role: shift.role,
      shift: shift.title,
      location: shift.location || "No specified",
      firstName: shift.employee.first_name || "",
      lastNmae: shift.employee.last_name || "",
      employeeId: shift.employee_id,
      status: shift.status,
      publishStatus: shift.publish_status,
      description: shift.description,
      profilePicture: shift.employee?.profile_picture || null,
      employeeName: shift.employee?.first_name || "",
    },
  }));

  if (loading) return <div>Loading shifts...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="relative min-w-[700px] max-w-full overflow-x-auto">
      {/* Navbar */}
      <Navbar messageState={handleMessageState} />

      {/* Calendar */}
      <div className="p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          events={events}
          height="auto"
          eventContent={(arg) => {
            const { role, shift, location, profilePicture, employeeName, firstName } = arg.event.extendedProps;
            return (
              <div className="grid gap-y-2 items-center gap-1 px-1 py-3 rounded-lg  text-white text-xs font-medium overflow-hidden whitespace-nowrap">
                {profilePicture ? (
                  <>
                  <div className="flex gap-2 text-center align-top md:justify-center">
                       <img
                        src={`http://localhost:8000${profilePicture}`}
                        alt={employeeName}
                        className="w-6 h-6 md:w-10 md:h-10 rounded-full object-cover flex-shrink-0"
                      />
                      <span className="truncated text-xs md:text-lg font-bold md:mt-2">{firstName}</span>
                  </div>
                  </>
                  
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {employeeName ? employeeName[0] : "?"}
                  </div>
                )}
                <div className="flex flex-col gap-4 md:text-center">
                    
                    <span className="truncate text-xs">{role}</span>
                    <span className="truncate text-xs">{shift}</span>
                    <span className="truncate text-xs">{location}</span>
                </div>
                
              </div>
            );
          }}
        />
      </div>

      

      {/* Chat Drawer */}
      <div
        className={`absolute top-10 min-h-screen h-screen right-0 min-w-[350px] bg-white shadow-xl z-50 p-4 overflow-auto transform transition-transform duration-500 ease-in-out ${
          message ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <Message onClose={() => setMessage(false)} />
      </div>
    </div>
  );
};

export default EmployeeSchedule;
