import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";

const WeeklyReview = ({ employeeId }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeOffRequest,setTimeOffRequest] = useState(null)

  // Calculate start of week (Monday = 1, Sunday = 0)
  const getWeekStart = (date) => {
    const newDate = new Date(date);
    const day = newDate.getDay(); // 0 = Sunday, 1 = Monday ...
    const diff = newDate.getDate() - day + (day === 0 ? -6 : 1); // adjust when Sunday
    const weekStartDate = new Date(newDate.setDate(diff));
    weekStartDate.setHours(0, 0, 0, 0); // reset time
    return weekStartDate;
  };

  useEffect(() => {
    const start = getWeekStart(selectedDate);
    setWeekStart(start);

    const formattedStart = start.toISOString().split("T")[0];

    setLoading(true);
    setError(null);
    setData(null);

    axios
      .get(`/api/employees/${employeeId}/weekly-schedule`, {
        params: {employee_id:employeeId, week_start: formattedStart },
      })
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error("Error fetching weekly schedule:", err);
        setError("Failed to load weekly review");
      })
      .finally(() => setLoading(false));
  }, [selectedDate, employeeId]);

  return (
    <div className="flex flex-col gap-y-8 ">
            <div className="p-4 rounded-lg shadow-xl bg-white w-full max-w-full">
            <h2 className="text-lg font-bold mb-4">Your Week</h2>

            {/* Date Picker */}
            <div className="mb-4">
                <label className="block mb-2 font-semibold">Select a week:</label>
                <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="MM/dd/yyyy"
                className="border rounded p-2"
                />
            </div>

            {/* Display */}
            {loading && <p className="text-gray-500">Loading weekly review...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {data && !loading && !error && (
                <div className="space-y-2">
                <p>
                    <strong>Scheduled Hours:</strong>{" "}
                    {data.scheduled_hours?.toFixed(2) ?? "0.00"}
                </p>
                <p>
                    vs {data.last_week_hours?.toFixed(2) ?? "0.00"} last week
                </p>
                <p>
                    <strong>Scheduled Est. Wages:</strong> $
                    {data.scheduled_wages?.toFixed(2) ?? "0.00"}
                </p>
                <p>
                    vs ${data.last_week_wages?.toFixed(2) ?? "0.00"} last week
                </p>
                </div>
            )}
            
            </div>
            <div className="p-4 rounded-lg shadow-xl bg-white w-full max-w-full flex flex-col">
                <p className="text-black font-semibold">Upcoming Time Off</p>
                <div className="items-center mx-auto mt-4">
                    {
                    timeOffRequest ? (
                            <>
                                <p>T</p>
                            </>
                    ) : (
                        <>
                            <p className="text-purple-600">No time off request</p>
                        </>
                    )
                }
                </div>
            
                <div className="items-center mx-auto mt-4">
                    <button className="bg-purple-700 text-white px-2 py-1 max-w-[250px]  font-semibold text-xs lg:text-sm rounded-md">Request Time Off</button>
                </div>
            </div>
    </div>
    
  );
};

export default WeeklyReview;
