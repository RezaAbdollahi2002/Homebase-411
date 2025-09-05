import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { FaHome } from 'react-icons/fa';
import { AiFillSchedule, AiFillMessage } from 'react-icons/ai';
import { BsMicrosoftTeams } from 'react-icons/bs';
import { FiSettings } from 'react-icons/fi';
import { PiSignOutBold } from 'react-icons/pi';

const Navbar = ({ messageState }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileScheduleOpen, setMobileScheduleOpen] = useState(false);

  const handleSignOut = () => {
    if (!window.confirm("Are you sure you want to sign out?")) return;
    navigate("/accounts/sign-in");
  };

  const messageStateFunction = () => {
    messageState(prev => !prev);
  };

  return (
    <>
      {/* Navbar */}
      <div className="grid grid-cols-2 px-2 bg-[#35175C] w-full py-2 items-center justify-between text-white font-semibold">
        {/* Left side */}
        <div className="hidden md:flex md:gap-3 items-center ">
          <Link
            to={"/onboarding/sign-up/employee-dashboard"}
            className="text-white mx-2 font-bold text-sm cursor-pointer hover:scale-105 duration:300"
          >
            Homebase
          </Link>

          {/* Desktop Schedule Dropdown */}
          <div className="relative group">
            <button className="text-purple-200 text-xs bg-transparent border-none  cursor-pointer hover:scale-105 duration:300">
              Schedule
            </button>
            <ul className="absolute top-full left-0 bg-[#35175C] text-white shadow-lg rounded mt-1 w-48 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-50">
              <li>
                <Link 
                  to={"/onboarding/Schedule"} 
                  className="block px-2 py-1 hover:bg-purple-700 text-sm"
                >
                  Schedule
                </Link>
              </li>
              <li>
                <Link 
                  to="/onboarding/My_Availabilities"
                  className="block px-2 py-1 hover:bg-purple-700 text-sm"
                >
                  My Availabilities
                </Link>
              </li>
            </ul>
          </div>

          <button
            onClick={messageStateFunction}
            className="text-purple-200 text-xs bg-transparent border-none cursor-pointer hover:scale-105 duration:300 "
          >
            Message
          </button>

          <Link to={`/onboarding/sign-up/team`} className="text-purple-200 text-xs cursor-pointer hover:scale-105 duration:300">
            Team
          </Link>
          <Link to={`/onboarding/sign-up/employee-settings`} className="text-purple-200 text-xs cursor-pointer hover:scale-105 duration:300">
            Settings
          </Link>
        </div>

        {/* Right side */}
        <div className="text-right hidden md:block">
          <p
            onClick={handleSignOut}
            className="text-purple-200 text-xs bg-transparent border-none cursor-pointer hover:font-bold"
          >
            Sign Out
          </p>
        </div>

        {/* Hamburger Icon for Mobile */}
        <button
          className="md:hidden text-white text-2xl"
          onClick={() => setSidebarOpen(true)}
        >
          <HiOutlineMenu />
        </button>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#35175C] text-white transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-500 ease-in-out z-50`}
      >
        <div className="flex items-center justify-between p-4 border-b border-purple-700">
          <h2 className="font-bold text-xl">Menu</h2>
          <button onClick={() => setSidebarOpen(false)} className="text-2xl">
            <HiOutlineX />
          </button>
        </div>

        <ul className="flex flex-col gap-4 mt-4 px-4">
          <Link
            to={"/onboarding/sign-up/employee-dashboard"}
            onClick={() => setSidebarOpen(false)}
            className="flex gap-2 items-center font-semibold hover:scale-105 duration-400"
          >
            <FaHome className="w-5 h-5 text-white"/>
            <span>Homebase</span>
          </Link>

          {/* Mobile Schedule Collapsible */}
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setMobileScheduleOpen(prev => !prev)}
              className="flex gap-2 items-center font-semibold w-full hover:scale-105 duration-400"
            >
              <AiFillSchedule className="w-5 h-5 text-white"/>
              <span>Schedule</span>
            </button>
            {mobileScheduleOpen && (
              <div className="flex flex-col pl-6 gap-1">
                <Link 
                  to={"/onboarding/Schedule"} 
                  onClick={() => setSidebarOpen(false)}
                  className="hover:bg-purple-700 px-2 py-1 rounded"
                >
                  Schedule
                </Link>
                <Link 
                  to={"/onboarding/My_Availabilities"} 
                  onClick={() => setSidebarOpen(false)}
                  className="hover:bg-purple-700 px-2 py-1 rounded"
                >
                  My Availabilities
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => { messageStateFunction(); setSidebarOpen(false); }}
            className="flex gap-2 items-center font-semibold w-full hover:scale-105 duration-400"
          >
            <AiFillMessage className="w-5 h-5 text-white"/>
            <span>Message</span>
          </button>

          <Link
            to={`/onboarding/sign-up/team`}
            onClick={() => setSidebarOpen(false)}
            className="flex gap-2 items-center font-semibold hover:scale-105 duration-400"
          >
            <BsMicrosoftTeams className="w-5 h-5 text-white"/>
            <span>Team</span>
          </Link>

          <Link
            to={`/onboarding/sign-up/employee-settings`}
            onClick={() => setSidebarOpen(false)}
            className="flex gap-2 items-center font-semibold hover:scale-105 duration-400"
          >
            <FiSettings className="w-5 h-5 text-white"/>
            <span>Settings</span>
          </Link>

          <button
            onClick={() => { handleSignOut(); setSidebarOpen(false); }}
            className="flex gap-2 items-center font-semibold hover:scale-105 duration-400"
          >
            <PiSignOutBold className="w-5 h-5 text-white"/>
            <span>Sign Out</span>
          </button>
        </ul>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
