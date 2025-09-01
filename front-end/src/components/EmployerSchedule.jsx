import { useState, useEffect, use } from "react";
import EmployerNavbar from "./EmployerNavbar";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Typewriter } from 'react-simple-typewriter';

const EmployerSchedule = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [addShift, setAddShift] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [publishStatus, setPublishStatus] = useState("unpublished");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState("scheduled");
  const [isRemoveShift, setIsRemoveShift] = useState(false);
  const [isEditShift, setIsEditShift] = useState(false);
  const [isHandleEdit, setIsHandleEdit] = useState(false);
  const [editShiftId, setEditShiftId] = useState(NaN);
  const [editEmployeeId, setEditEmployeeId] = useState(NaN);
  const [editTitle, setEditTitle] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [published, setPublished] = useState(true);
  
 
  




  const employerId = localStorage.getItem("employer_id");

  useEffect(() => {
    // Fetch shifts with employee info
    axios.get("http://localhost:8000/shifts/employer", {params: {"employer_id": employerId,"published": published }})
      .then(res => { 
        setShifts(res.data); 
        setLoading(false); 
      })
      .catch(err => { 
        setError(err.response?.data?.detail || "Failed to load shifts"); 
        setLoading(false); 
      });

    // Fetch team members
    axios.get(`http://localhost:8000/shifts/employees/team/${employerId}`)
      .then(res => {
        setTeamMembers(res.data);
      }
    )
      .catch(err => console.error("Failed to fetch team members:", err));
  }, [employerId]);

  const filteredMembers = teamMembers.filter(member =>
    member.first_name.toLowerCase().includes(search.toLowerCase())
  );
  

  const events = shifts.map((shift) => ({
    id: shift.id,
    title: `${shift.role} - ${shift.title} @ ${shift.location || "No location"}`,
    role: shift.role,
    location : shift.location,
    start: new Date(shift.start_time),
    end: new Date(shift.end_time),
    backgroundColor: shift.role === "Supervisor" ? "yellow" : "#6e2a3c",
    extendedProps: {
      employeeId: shift.employee_id,
      status: shift.status,
      publishStatus: shift.publish_status,
      description: shift.description,
      profilePicture: shift.employee?.profile_picture || null,
      employeeName: shift.employee?.first_name || "",
    },
    
  }));
  
  const handleCreateShift = () => {
    if (!selectedMember || !role || !location || !publishStatus || !title || !startTime || !endTime) {
  console.log({ selectedMember, role, location, publishStatus, title, startTime, endTime, status });
  alert("Please fill all fields and select a member!");
  return;
}

    const employerIdNum = Number(employerId);
    
    const formatDateTime = (dt) => {
      if (!dt) return null;
      if (dt.length === 16) return dt + ":00";
      return dt;
    };

    const payload = {
      employee_id: selectedMember.id,
      employer_id: employerIdNum,
      role,
      location,
      publish_status: publishStatus,
      status,
      title,
      description,
      start_time: formatDateTime(startTime),
      end_time: formatDateTime(endTime),
    };
    console.log(payload)
    

    axios.post("http://localhost:8000/shifts", payload)
      .then(res => {
        alert("Shift created successfully!");
        setShifts(prev => [...prev, res.data]);
        setSelectedMember(null);
        setRole(""); setLocation(""); setPublishStatus("");
        setTitle(""); setDescription(""); setStartTime(""); setEndTime("");
      })
      .catch(err => {
        console.error("Backend error:", err.response?.data || err.message);
        alert("Failed to create shift!");
      });
  };
    const handleEdit = () => {
        if (editShiftId == null || editEmployeeId == null ){
          alert("Please fill out shift_id and ")
        }
        const editEmployeeIDNumber = Number(editEmployeeId);
    
    const formatDateTime = (dt) => {
      if (!dt) return null;
      if (dt.length === 16) return dt + ":00";
      return dt;
    };
    const payload = {
      employee_id : editEmployeeIDNumber,
      title: editTitle,
      start_time: formatDateTime(editStartTime),
      end_time: formatDateTime(editEndTime),
    };
    console.log(payload)

    axios.put(`http://localhost:8000/shifts/${editShiftId}/edit`, null, {params: payload})
      .then(res => {
        alert("Shift updated successfully!");
        setShifts(prev => [...prev, res.data]);
        setSelectedMember(null);
        setRole(""); setLocation(""); setPublishStatus("");
        setTitle(""); setDescription(""); setStartTime(""); setEndTime("");
        setEditEmployeeId(NaN); setEditEndTime(null); setEditShiftId(NaN); setEditStartTime(null);

      })
      .catch(err => {
        console.error("Backend error:", err.response?.data || err.message);
        alert("Failed to update shift!");
      });
      }


  const handleRemoveShift = (shiftId) => {
    if (!window.confirm("Are you sure you want to delete this shift?")) return;

    axios.delete(`http://localhost:8000/shifts/${shiftId}`)
      .then(() => {
        alert("Shift removed successfully!");
        setShifts(prev => prev.filter(s => s.id !== shiftId));
      })
      .catch(err => {
        console.error("Failed to delete shift:", err.response?.data || err.message);
        alert("Failed to remove shift!");
      });
  };


  if (loading) return <p>Loading shifts...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  return (
    <div>
      <EmployerNavbar />

      <div className="bg-gray-800 text-white font-semibold">
        <ul className="flex gap-x-4 pl-4 py-2">
          <li className="hover:scale-105 hover:font-bold duration-75 cursor-pointer" onClick={() => setAddShift(!addShift)}>Add Shift</li>
          <li className="hover:scale-105 hover:font-bold duration-75" onClick={() => setIsEditShift(!isEditShift)}>Edit Shift</li>
          {/* <li className="hover:scale-105 hover:font-bold duration-75" onClick={() => setIsRemoveShift(!isRemoveShift)}>Remove Shift</li> */}
          <li className="hover:scale-105 hover:font-bold duration-75" onClick={() => setPublished(true)}>Published Shifts</li>
          <li className="hover:scale-105 hover:font-bold duration-75" onClick={() => setPublished(false)}>Unpublished Shifts</li>
        </ul>
      </div> 




      {/* Add Shift Form */}
      {addShift && (
        <div className="px-4 py-2 border border-gray-400 shadow-2xl max-w-[400px] mx-auto flex flex-col gap-y-3 text-black mt-6 bg-white ">
          <input
            className="text-xs lg:text-sm text-gray-700 px-2 py-1 border rounded-sm"
            placeholder="Search Team members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {filteredMembers.length > 0 ? (
            <div className="max-h-40 overflow-y-auto text-xs">
              {filteredMembers.map(member => (
                <div
                  key={member.id}
                  className={`grid grid-cols-1 md:grid-cols-3 border-b border-gray-300 px-4 py-3 items-center cursor-pointer ${selectedMember?.id === member.id ? "bg-purple-300" : "bg-white"}`}
                  onClick={() => setSelectedMember(member)}
                >
                  <div className="flex items-center space-x-3">
                    {member.profile_picture ? (
                      <img src={member.profile_picture} alt={`${member.first_name} ${member.last_name}`} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">{member.first_name[0]}</div>
                    )}
                    <p className="text-sm">{member.first_name} {member.last_name}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="mt-4 text-gray-500">No team members found.</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs lg:text-sm mt-2">
            <input className="p-1 border" type="text" placeholder="Role" value={role} onChange={(e) => setRole(e.target.value)} />
            <input className="p-1 border" type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />

            <select className="p-1 border" value={publishStatus} onChange={(e) => setPublishStatus(e.target.value || "Unpublished")}>
              <option value="unpublished">Unpublished</option>
              <option value="published">Published</option>
            </select>

            <input className="p-1 border" type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <input className="p-1 border" type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

            <select className="p-1 border" value={status} onChange={(e) => setStatus(e.target.value || "Completed")}>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <div className="flex flex-col">
              <p className="font-semibold text-black mb-1">Start time</p>
              <input className="p-1 border" type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="flex flex-col">
              <p className="font-semibold text-black mb-1">End time</p>
              <input className="p-1 border" type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>

          <button className="mt-3 p-2 bg-blue-500 text-white rounded" onClick={handleCreateShift}>Create Shift</button>
        </div>
      )}

      {/* Edit Shift */}
      {isEditShift && (
        <div className="px-4 py-2 border border-gray-400 shadow-2xl max-w-[500px] mx-auto flex flex-col gap-y-3 text-black mt-4 bg-white mb-4 ">
          <h3 className="font-semibold text-lg">Edit Shifts</h3>
          {shifts.length > 0 ? (
            <div className="max-h-60 overflow-y-auto text-sm">
              {shifts.map((shift) => (
                <div
                        key={shift.id}
                        className="border border-gray-400 text-xs lg:text-sm font-semibold rounded-sm px-2 py-2 flex flex-col hover:shadow-lg hover:scale-[1.01] duration-200"
                      >
                        <div className="flex justify-between text-black">
                          <span>
                            {shift.employee?.first_name} {shift.employee?.last_name}
                          </span>
                          <span>
                            {new Date(shift.start_time).toLocaleString()} →{" "}
                            {new Date(shift.end_time).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-gray-600">
                          {shift.role} — {shift.title} @ {shift.location}
                        </div>
                        <div className="mt-2 flex gap-2">
                          <button className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600" onClick={() => {
                            setIsHandleEdit(!isHandleEdit);
                            setEditShiftId(shift.id);
                            setEditEmployeeId(shift.employee_id);

                          }}>
                            Edit
                          </button>
                          <button
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            onClick={() => handleRemoveShift(shift.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No shifts available</p>
                )}
              </div>
            )}
            {
              isHandleEdit && (
                <>
                  <div className="border border-gray-400 rounded-sm px-4 py-2 grid grid-cols-1 md:grid-cols-2 max-w-[500px] mx-auto shadow-3xl" >
                    <input className="text-xs lg:text-sm px-1 focus:outline-none focus:border-transparent focus:ring-0 mb-2"  type="text" placeholder="title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}/>
                    <div className="flex flex-col ">
                      <p className="text-xs lg:text-sm font-semibold ">Start time</p>
                      <input className="mb-2" type="datetime-local" placeholder="start time" value={editStartTime} onChange={(e) => setEditStartTime(e.target.value)}/>
                    </div>
                    <div className="flex flex-col ">
                        <p className="text-xs lg:text-sm font-semibold ">End time</p>
                        <input type="datetime-local" placeholder="end time"  value={editEndTime} onChange={(e) => setEditEndTime(e.target.value)}/>
                    </div>
                    
                    <button type="button" className="px-2 py-1 rounded-sm text-white bg-purple-700" onClick={handleEdit}>Edit</button>
                  </div>
                </>
              )
            }


      {/* Remove Shift */}
      {/* {isRemoveShift && (
        <div className="px-4 py-2 border border-gray-400 shadow-2xl max-w-[500px] mx-auto flex flex-col gap-y-3 text-black mt-6 bg-white">
          <h3 className="font-semibold text-lg">Remove Shift</h3>
          {shifts.length > 0 ? (
            <div className="max-h-60 overflow-y-auto text-sm">
              {shifts.map((shift) => (
                <div key={shift.id} className="flex justify-between items-center border-b border-gray-300 py-2">
                  <p>{shift.title} — {new Date(shift.start_time).toLocaleString()} → {new Date(shift.end_time).toLocaleString()}</p>
                  <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600" onClick={() => handleRemoveShift(shift.id)}>Remove</button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No shifts available</p>
          )}
        </div>
      )} */}

      {/* FullCalendar */}
      {
        published && (
          <>
          <h1 className="text-center my-5 text-lg md:text-2xl xl:text:3xl font-bold text-[#292424]">  
            <Typewriter 
            words ={['Published Schedule']}
            loop={true}
            cursor
            cursorStyle="|"
            typeSpeed={70}
            deleteSpeed={50}
            delaySpeed={1000}
          />
          </h1>
          
            <div className="p-4">
              <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="timeGridWeek"
                  events={events}
                  height="auto"
                  headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay"
                }}
                  eventContent={(arg) => {
                    const { role, title, location, profilePicture, employeeName } = arg.event.extendedProps;

                    return (
                      <div className="lg:flex items-start gap-2 px-1 py-3 rounded-lg  text-white text-xs md:text-sm font-semibold text-center justify-center w-full h-full  border shadow-2xl hover:scale-106 duration-200 hover:bg-[#b62f52]">
                        {/* Profile Picture or Initial */}
                        {profilePicture ? (
                          <>
                            <div className="flex gap-5 justify-center lg:justify-start">
                                   <img
                                    src={`http://localhost:8000${profilePicture}`}
                                    alt={employeeName}
                                    className="w-6 h-6  md:w-10 md:h-10  rounded-full object-cover flex-shrink-0"
                                  />
                                  
                            </div>
                          </>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {employeeName ? employeeName[0] : "?"}
                          </div>
                        )}

                        {/* Shift Info */}
                        <div className="grid grid-cols-1 gap-y-2 md:ml-2 text-center break-words text-xs md:text-sm ">
                          <span className="font-bold mt-2">{employeeName || "employee"}</span>
                          <span className="hidden md:block">{role} - {title}</span>
                          {location && <span className="text-xs md:text-sm">{location}</span>}
                        </div>
                      </div>
                    );
                  }}
                  />
            </div>
          </>
        )
      }
      {
        !published && (
          <>
          <h1 className="text-center my-5 text-lg md:text-2xl xl:text:3xl font-bold text-[#292424]">  
            <Typewriter 
            words ={['Unpublished Schedule']}
            loop={true}
            cursor
            cursorStyle="|"
            typeSpeed={70}
            deleteSpeed={50}
            delaySpeed={1000}
          />
          </h1>
          
            <div className="p-4">
              <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="timeGridWeek"
                  events={events}
                  height="auto"
                  headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay"
                }}
                  eventContent={(arg) => {
                    const { role, title, location, profilePicture, employeeName } = arg.event.extendedProps;

                    return (
                      <div className="lg:flex items-start gap-2 px-1 py-3 rounded-lg  text-white text-xs md:text-sm font-semibold text-center justify-center w-full h-full  border shadow-2xl hover:scale-106 duration-200 hover:bg-[#b62f52]">
                        {/* Profile Picture or Initial */}
                        {profilePicture ? (
                          <>
                            <div className="flex gap-5 justify-center lg:justify-start">
                                   <img
                                    src={`http://localhost:8000${profilePicture}`}
                                    alt={employeeName}
                                    className="w-6 h-6  md:w-10 md:h-10  rounded-full object-cover flex-shrink-0"
                                  />
                                  
                            </div>
                          </>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {employeeName ? employeeName[0] : "?"}
                          </div>
                        )}

                        {/* Shift Info */}
                        <div className="grid grid-cols-1 gap-y-2 md:ml-2 text-center break-words text-xs md:text-sm ">
                          <span className="font-bold mt-2">{employeeName || "employee"}</span>
                          <span className="hidden md:block">{role} - {title}</span>
                          {location && <span className="text-xs md:text-sm">{location}</span>}
                        </div>
                      </div>
                    );
                  }}
                  />
            </div>
          </>
        )
      }
    </div>
  );
};

export default EmployerSchedule;
