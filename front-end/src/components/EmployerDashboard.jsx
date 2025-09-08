import EmployerNavbar from "./EmployerNavbar";
import { useEffect, useState } from "react";
import Message from "./Message";
import EmployerAnnouncements from "./EmployerAnnouncements";
import axios from "axios";

const EmployerDashboard = ({ message }) => {

  const [employerName, setEmployerName] = useState("Employer");
  const [loading, setLoading] = useState(true);
  const [error,setError]= useState("");

  const employerId = localStorage.getItem("employer_id");


  
useEffect(() => {
    if (!employerId) return;

    const controller = new AbortController();
    const fetchName = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get("/api/employers/name", {
          params: { employer_id: employerId },
          signal: controller.signal,
        });
        setEmployerName(res.data.first_name ?? "BOSS");
      } catch (err) {
        if (axios.isCancel(err)) return;
        // Optional: handle 404 differently
        if (err?.response?.status === 404) {
          setError("Employer not found");
        } else {
          setError("Could not load employer name");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchName();
    return () => controller.abort();
  }, [employerId]);

  
  
  return (
    <div className="bg-gray-200 min-h-screen p-4 grid- grid-cols-2">
      <h1 className="text-center font-bold  text-xl md:text-2xl lg:text-3xl my-2">Hello back, {employerName}</h1>
      {/* Main dashboard content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-10">
        <div className={`bg-black rounded-xl p-4 shadow col-span-2`}>
          {/* left panel */}
          <EmployerAnnouncements />
          
        </div>

          {/* right panel */}
          <div>
            hI
          </div>
        {/* Message panel */}
        {message && (
          <div
            className={`absolute top-10 h-screen right-0 min-w-[350px] bg-white shadow-xl z-50 p-4 overflow-auto transform transition-transform duration-1000 ease-in-out ${
              message ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <Message onClose={() => setMessage(false)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerDashboard;
