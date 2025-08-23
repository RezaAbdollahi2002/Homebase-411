import { useState, useEffect } from "react";
import axios from "axios";

const EmployeeShiftsDashboard = ({ employee_id }) => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [Announcements,setAnnouncements] = useState([]); 

  useEffect(() => {
    if (!employee_id) return;

    setLoading(true);
    setError(""); // reset error
    console.log(employee_id)

    axios
        .get("/api/employee/shifts-dashboard", { params: { employee_id } })
        .then((res) => {
            console.log("res.data:", res.data);
                console.log("Array.isArray(res.data)?", Array.isArray(res.data));
                setShifts(Array.isArray(res.data) ? res.data : []);
        })
        .catch((err) => {
            if (err.response && err.response.status === 404) {
            setShifts([]);
            setError("No shifts available");
            } else {
            setError(err.message || "Error fetching shifts");
            }
        })
        .finally(() => setLoading(false));
        }, [employee_id]);

  return (
    <div className="px-4 py-2 flex flex-col space-y-4">
        <h1 className="text-lg lg:text-xl mb-2">Announcement</h1>
        <div className="p-4 rounded-lg shadow-xl bg-white w-full max-w-full"> 
            
            {
                    Announcements.map((a,index) => (
                        <>
                            <div
                            key={index}
                                className="px-3 py-2 border border-gray-300 rounded-md shadow-2xl bg-white hover:scale-105 duration-300"
                            >

                            </div>
                        </>
                    ))
            }
        </div>
        <h1 className="md:text-xl text-lg mt-10">My Shifts</h1>
      {loading && <p>Loading...</p>}

      {!loading && error && <p className="text-red-500">{error}</p>}

      {!loading && !error && shifts.length === 0 && (
        <p className="text-gray-500">No shifts available</p>
      )}
    <div className="p-4 rounded-lg shadow-xl bg-white w-full max-w-full flex flex-col gap-y-4 border-gray-400 ">
        {!loading &&
        !error &&
        shifts.map((shift,index) => (
            <>
                
                <div
                key={index}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-2xl bg-white hover:scale-105 duration-300"
            >
                <h3 className="font-bold text-black">{shift.role}</h3>
                <p className="text-gray-600">
                {new Date(shift.start_time).toLocaleString()} –{" "}
                {new Date(shift.end_time).toLocaleString()}
                </p>
                <p>{shift.location}</p>
            </div>
            </>
          
        ))}
    </div>
      
    </div>
  );
};

export default EmployeeShiftsDashboard;
