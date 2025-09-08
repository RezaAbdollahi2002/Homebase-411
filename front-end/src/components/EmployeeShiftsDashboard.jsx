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
    <div className="px-4 py-2 flex flex-col space-y-4 text-black">
        
        <h1 className="md:text-xl text-lg mt-10 font-bold">My Shifts</h1>
      {loading && <p>Loading...</p>}

      {!loading && error && <p className="text-red-500">{error}</p>}

      {!loading && !error && shifts.length === 0 && (
        <p className="text-black-500 font-semibold ">No shifts available</p>
      )}
    <div className="p-4 rounded-lg shadow-xl  w-full max-w-full flex flex-col gap-y-4 border-gray-400 bg-transparent">
        {!loading &&
        !error &&
        shifts.map((shift,index) => (
            <>
                
                <div
                key={index}
                className="bg-[#290f34] px-3 py-2 rounded-sm shadow-4xl hover:shadow-2xl hover:show-white  hover:scale-95 duration-200 "
            >
                <h3 className="font-bold text-gray-300">{shift.role}</h3>
                <p className="text-white">
                {new Date(shift.start_time).toLocaleString()} –{" "}
                {new Date(shift.end_time).toLocaleString()}
                </p>
                <p className="text-gray-200">{shift.location}</p>
            </div>
            </>
          
        ))}
    </div>
      
    </div>
  );
};

export default EmployeeShiftsDashboard;
