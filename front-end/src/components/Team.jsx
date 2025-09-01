import { IoSearchSharp } from "react-icons/io5";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import EmployerNavbar from "./EmployerNavbar";
import Message from "./Message";

const Team = ({ message, handleMessageState, setMessage }) => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [isEmployee, setIsEmployee] = useState(false);

  // Determine user type and fetch team members
  useEffect(() => {
    const employeeId = localStorage.getItem("employee_id");
    const employerId = localStorage.getItem("employer_id");

    if (employeeId) {
      setIsEmployee(true);
      fetch(`/api/employees/team?employee_id=${employeeId}`)
        .then((res) => res.json())
        .then((data) => setTeamMembers(data))
        .catch((err) => console.error(err));
    } else if (employerId) {
      setIsEmployee(false);
      fetch(`/api/employees/team?employer_id=${employerId}`)
        .then((res) => res.json())
        .then((data) => setTeamMembers(data))
        .catch((err) => console.error(err));
    }
  }, []);

  const filteredMembers = teamMembers.filter((member) =>
    member.full_name.toLowerCase().includes(search.toLowerCase())
  );

  
      return (
  <div className="min-h-screen bg-[#E5E5E5] pt-0 py-6 relative overflow-x-auto">
    <div className="min-w-[600px]">
      {/* Navbar */}
      {isEmployee ? (
        <Navbar messageState={handleMessageState} />
      ) : (
        <EmployerNavbar messageState={handleMessageState} />
      )}

      {/* Page container */}
      <div className="w-full px-4">
        {/* Team list */}
        <div className="w-full transition-all duration-700">
          <h1 className="text-lg md:text-xl lg:text-3xl font-bold text-purple-950 my-3">
            Team roster
          </h1>
          <p className="text-sm text-gray-600">
            {filteredMembers.length} team members
          </p>

          {/* Search */}
          <div className="flex items-center mt-4">
            <IoSearchSharp className="w-4 h-4 -mr-6 ml-1" />
            <input
              type="text"
              placeholder="Search team members"
              className="border border-gray-400 rounded-sm px-7 text-black font-semibold text-sm py-1 focus:outline-none focus:ring-2 focus:ring-purple-600"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Header row */}
          <div className="grid grid-cols-3 gap-8 bg-[#DBDAEA] mt-6 -ml-1 px-4 py-3 font-semibold">
            <p className="text-xs md:text-sm">Team Member</p>
            <p className="text-xs md:text-sm">Access Level</p>
            <p className="text-xs md:text-sm">Location</p>
          </div>

          {/* Team members */}
          <div className="overflow-auto max-h-[70vh]">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="grid grid-cols-3 gap-11 bg-white border-b border-gray-300 -ml-1 px-4 py-3 items-center"
                >
                  <div className="flex items-center space-x-3">
                    {member.profile_picture ? (
                      <img
                        src={member.profile_picture}
                        alt={member.full_name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
                        {member.full_name[0]}
                      </div>
                    )}
                    <p className="text-sm">{member.full_name}</p>
                  </div>
                  <p className="text-sm">{member.access_level}</p>
                  <p className="text-sm">{member.company_location}</p>
                </div>
              ))
            ) : (
              <p className="mt-4 text-gray-500">No team members found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Sliding message panel */}
      <div
        className={`absolute top-10 h-screen right-0 min-w-[350px] bg-white shadow-xl z-50 p-4 overflow-auto transform transition-transform duration-1000 ease-in-out ${
          message ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <Message onClose={() => setMessage(false)} />
      </div>
    </div>
  </div>
);

};

export default Team;
