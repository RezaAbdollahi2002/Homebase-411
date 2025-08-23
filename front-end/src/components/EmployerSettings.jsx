import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import EmployerNavbar from './EmployerNavbar';

const EmployerSettings = () => {
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const links = [
    { to: 'employer-settings-profile', label: 'Profile' },
    { to: 'employer-settings-locations', label: 'Locations & PINs' },
    { to: 'employer-settings-notifications', label: 'Notifications' },
    { to: 'employer-settings-passwordandsecurity', label: 'Password & Security' },
  ];

  // Find current active link to show in dropdown button
  const currentLink = links.find(link => location.pathname.includes(link.to)) || links[0];

  return (
    <>
      <EmployerNavbar />
      <div className="h-screen lg:flex">
        {/* Sidebar for large screens */}
        <div className="hidden lg:block  bg-gray-100 p-4 border-r ">
          <h1 className="font-semibold text-lg mb-4">Accounts</h1>
          <ul className="flex flex-col gap-3">
            {links.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`block p-2 rounded ${
                    location.pathname.includes(link.to)
                      ? 'bg-purple-200 text-purple-900 font-semibold'
                      : 'text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Dropdown for medium and smaller screens */}
        <div className="lg:hidden p-4 border-b bg-gray-100">
          <label className="block mb-2 font-semibold text-lg" htmlFor="settings-dropdown">Accounts</label>
          <button
            id="settings-dropdown"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full p-2 border rounded bg-white flex justify-between items-center"
          >
            <span>{currentLink.label}</span>
            <svg
              className={`w-5 h-5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          {dropdownOpen && (
            <ul className="mt-2 bg-white border rounded shadow-md">
              {links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    onClick={() => setDropdownOpen(false)}
                    className={`block p-2 hover:bg-purple-200 ${
                      location.pathname.includes(link.to) ? 'bg-purple-200 font-semibold text-purple-900' : 'text-gray-900'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 py-6 px-4 overflow-auto">
          <Outlet /> {/* This is where the selected page will load */}
        </div>
      </div>
    </>
  );
};

export default EmployerSettings;
