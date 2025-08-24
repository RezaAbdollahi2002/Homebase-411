import { IoSearchSharp } from "react-icons/io5";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import EmployerNavbar from "./EmployerNavbar"; // make sure you have this component

const Team = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [search, setSearch] = useState("");

  // Determine which navbar to show
  const [isEmployee, setIsEmployee] = useState(false);

  useEffect(() => {
  const employeeId = localStorage.getItem("employee_id");
  const employerId = localStorage.getItem("employer_id");

  if (employeeId) {
    setIsEmployee(true);

    // Fetch team members by employee_id
    fetch(`/api/employees/team?employee_id=${employeeId}`)
      .then((res) => res.json())
      .then((data) => setTeamMembers(data))
      .catch((err) => console.error("Failed to fetch team members:", err));

  } else if (employerId) {
    setIsEmployee(false);

    // Fetch team members by employer_id
    fetch(`/api/employees/team?employer_id=${employerId}`)
      .then((res) => res.json())
      .then((data) => setTeamMembers(data))
      .catch((err) => console.error("Failed to fetch team members:", err));

  } else {
    // Optionally redirect to login if neither ID exists
    console.warn("No employee or employer ID found in localStorage");
  }
}, []);


  // Filter team members based on search input
  const filteredMembers = teamMembers.filter(member =>
    member.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {isEmployee ? <Navbar /> : <EmployerNavbar />}
      <div className='min-h-screen w-full bg-[#F2F5FF]'>
        <div className='px-10 py-6'>
          <h1 className='text-lg md:text-xl lg:text-3xl xl:text-3xl font-bold text-purple-950 my-3'>
            Team roster
          </h1>
          <p className='text-sm lg:text-medium text-gray-600'>
            {filteredMembers.length} team members
          </p>

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

          <div className="grid grid-cols-1 md:grid-cols-3 bg-[#DBDAEA] mt-6 -ml-1 px-4 py-3 font-semibold">
            <p className="text-xs md:text-sm">Team Member</p>
            <p className="text-xs md:text-sm">Access Level</p>
            <p className="text-xs md:text-sm">Location</p>
          </div>

          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <div key={member.id} className="grid grid-cols-1 md:grid-cols-3 bg-white border-b border-gray-300 -ml-1 px-4 py-3 items-center">
                <div className="flex items-center space-x-3">
                  {member.profile_picture ? (
                    <img src={member.profile_picture} alt={member.full_name} className="w-8 h-8 rounded-full object-cover" />
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
    </>
  );
};

export default Team;
