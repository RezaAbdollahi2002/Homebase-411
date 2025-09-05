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
      .get(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
        }/shifts/employee`,
        {
          params: { employee_id: employeeId },
        }
      )
      .then((res) => {
        // Normalize API response
        const normalized = res.data.map((shift) => ({
          ...shift,
          employee: {
            ...shift.employee,
            firstName: shift.employee?.first_name || "",
            lastName: shift.employee?.last_name || "",
            profilePicture: shift.employee?.profile_picture || null,
          },
        }));
        setShifts(normalized);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || "Failed to load shifts");
        setLoading(false);
      });
  }, [employeeId]);

  const events = shifts.map((shift) => ({
    id: shift.id,
    title: `${shift.role} - ${shift.title}`,
    start: new Date(shift.start_time),
    end: new Date(shift.end_time),
    backgroundColor: shift.role === "Supervisor" ? "#5E7B94" : "#5E141E",
    extendedProps: {
      role: shift.role,
      shift: shift.title,
      location: shift.location || "No specified",
      firstName: shift.employee?.firstName,
      lastName: shift.employee?.lastName,
      employeeId: shift.employee_id,
      status: shift.status,
      publishStatus: shift.publish_status,
      description: shift.description,
      profilePicture: shift.employee?.profilePicture,
    },
  }));

  if (loading) return <div>Loading shifts...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="relative min-w-[700px] max-w-full overflow-x-auto">
      {/* Navbar */}
      <Navbar messageState={handleMessageState} />

      {/* Calendar + List */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Left panel: list of shifts */}
        <div className="md:col-span-1 space-y-2">
          {shifts.map((shift, index) => {
            const fullName = `${shift.employee?.firstName} ${shift.employee?.lastName}`.trim();

            return (
              <div
                key={shift.id || index}
                className="border border-gray-300 rounded-md flex items-center gap-3 px-2 py-1 text-gray-800"
              >
                {shift.employee?.profilePicture ? (
                  <img
                    src={`http://localhost:8000${shift.employee.profilePicture}`}
                    alt={fullName}
                    className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {shift.employee?.firstName ? shift.employee.firstName[0] : "?"}
                  </div>
                )}
                <div className="truncate">{fullName || "Unnamed Employee"}</div>
              </div>
            );
          })}
        </div>

        {/* Right panel: calendar */}
        <div className="md:col-span-3">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            events={events}
            height="auto"
            eventContent={(arg) => {
              const {
                role,
                shift,
                location,
                profilePicture,
                firstName,
                lastName,
              } = arg.event.extendedProps;

              const fullName = `${firstName || ""} ${lastName || ""}`.trim();

              return (
                <div className="flex items-center gap-2 px-1 py-1 rounded-lg text-white text-xs font-medium overflow-hidden">
                  {/* Avatar + name */}
                  <div className="flex items-center gap-1 min-w-[80px]">
                    {profilePicture ? (
                      <img
                        src={`http://localhost:8000${profilePicture}`}
                        alt={fullName}
                        className="w-5 h-5 md:w-6 md:h-6 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {firstName ? firstName[0] : "?"}
                      </div>
                    )}
                    <span className="truncate font-bold text-xs md:text-sm">
                      {fullName}
                    </span>
                  </div>

                  {/* Shift details */}
                  <div className="flex flex-col text-left">
                    <span className="truncate text-xs">{role}</span>
                    <span className="truncate text-xs hidden lg:block">
                      {shift}
                    </span>
                    <span className="truncate text-xs hidden lg:block">
                      {location}
                    </span>
                  </div>
                </div>
              );
            }}
          />
        </div>
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
