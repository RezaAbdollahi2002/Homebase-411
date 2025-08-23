

import { useState, useEffect } from "react";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Navbar from "./Navbar";

const EmployeeSchedule = () => {

  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);

  const employeeId = localStorage.getItem('employee_id');

  useEffect(() => {
    // Fetch shifts with employee info
    

      axios.get("http://localhost:8000/shifts/employee", {params: {"employee_id": employeeId}}).then(
        res => { 
        setShifts(res.data); 
        setLoading(false); 
      }
      ).catch(err => { 
        setError(err.response?.data?.detail || "Failed to load shifts"); 
        setLoading(false); 
      });

  }, [employeeId]);


  const events = shifts.map((shift) => ({
    id: shift.id,
    title: `${shift.role} - ${shift.title} @ ${shift.location || "No location"}`,
    start: new Date(shift.start_time),
    end: new Date(shift.end_time),
    backgroundColor: shift.role === "Supervisor" ? "#f87171" : "#60a5fa",
    extendedProps: {
      employeeId: shift.employee_id,
      status: shift.status,
      publishStatus: shift.publish_status,
      description: shift.description,
      profilePicture: shift.employee?.profile_picture || null,
      employeeName: shift.employee?.first_name || "",
    },
    
  }));

  
  return (
    <div>
        <Navbar />
        <div>
            <div className="p-4">
        <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            events={events}
            height="auto"
            eventContent={(arg) => {
              const { profilePicture, employeeName } = arg.event.extendedProps;

              return (
                <div className="flex items-center gap-1 px-1 py-1 rounded-lg bg-blue-200 text-black text-xs font-medium overflow-hidden">
                  {profilePicture ? (
                    <img
                      src={`http://localhost:8000${profilePicture}`}
                      alt={employeeName}
                      className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {employeeName ? employeeName[0] : "?"}
                    </div>
                  )}
                  <span className="truncate">{arg.event.title}</span>
                </div>
              );
            }}
            />
      </div>
        </div>
    </div>
  )
}

export default EmployeeSchedule
