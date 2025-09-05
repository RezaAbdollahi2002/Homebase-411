import axios from 'axios';
import React, { useEffect, useState } from 'react';


const EmployeeAnnouncement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [more,setMore] = useState(true);
  const [less,setLess] = useState(false);
  const employeeId = localStorage.getItem("employee_id");
  const [moreAnnouncements, setMoreAnnoucements] = useState(false);

  useEffect(() => {
    if (!employeeId) return;
    console.log("Employee id:" + employeeId);

    const fetchAnnouncements = async () => {
      try {
        const res = await axios.get("/api/announcements/employee/get-announcements/", {
          params: { "employee_id": employeeId },
        });
        setAnnouncements(res.data);
      } catch (err) {
        console.error("Error fetching announcements:", err);
      }
    };

    fetchAnnouncements();
  }, [employeeId]);

  return (
    <div className="bg-[#4A6677] p-4">
  {announcements.length === 0 ? (
    <p className="text-white">No announcements found</p>
  ) : (
    <>
      <ul className="list-none space-y-3">
        {(moreAnnouncements ? announcements : announcements.slice(0, 2)).map((a, index) => (
          <li key={a.id ?? index}>
            <div className="border border-gray-400 shadow-xl px-2 py-1 hover:scale-105 duration-500 bg-white rounded-sm">
              <h1 className="text-black font-bold text-xl md:text-2xl text-center">{a.title}</h1>
              <hr />
              {more ? (
                <p className="w-full break-words px-2 py-1">
                  {String(a.message ?? "").slice(0, 30)}
                  <button
                    type="button"
                    className="text-purple-700 text-xs ml-1 underline"
                    onClick={() => setMore(!more)}
                  >
                    ...more
                  </button>
                </p>
              ) : (
                <p className="w-full break-words px-2 py-1">
                  {a.message}
                  <button
                    type="button"
                    className="text-purple-700 text-xs ml-1 underline"
                    onClick={() => setMore(!more)}
                  >
                    less
                  </button>
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Centered Show all / Show less */}
      {announcements.length > 2 && (
        <div className="flex justify-center">
          <button
            className="text-black bg-gray-100 mt-5 px-3 py-1 rounded-sm hover:font-semibold hover:scale-105 duration-300"
            onClick={() => setMoreAnnoucements(!moreAnnouncements)} // keep your state name
          >
            {moreAnnouncements ? "Show less" : `Show all (${announcements.length})`}
          </button>
        </div>
      )}
    </>
  )}
</div>

  );
};

export default EmployeeAnnouncement;
