import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const EmployerNavbar = ({ messageState }) => {
  const navigate = useNavigate();
  const [message, setMessages] = useState(false);

  const handleSignOut = () => {
    const confirm = window.confirm("Are you sure you want to sign out?");
    if (!confirm) return;

    console.log("Signing out...");
    navigate("/accounts/sign-in"); 
  };

  const messageStateFunction = () => {
    const newValue = !message;   // ✅ compute next state
    setMessages(newValue);
    messageState(newValue);      // ✅ pass the updated value up
  };

  return (
    <div className="flex px-2 bg-purple-950 w-full py-2 items-center justify-between">
      <ul className="flex gap-3 items-center">
        <Link
          to={"/onboarding/sign-up/employer-dashboard"}
          className="text-white mx-2 font-bold text-sm"
        >
          Homebase
        </Link>
        <Link
          to={"/onboarding/sign-up/employer-schedule"}
          className="text-purple-200 text-xs"
        >
          Schedule
        </Link>
        <button
          onClick={messageStateFunction}
          className="text-purple-200 text-xs bg-transparent border-none cursor-pointer"
        >
          Message
        </button>
        <Link
          to={`/onborading/sign-up/team`}
          className="text-purple-200 text-xs"
        >
          Team
        </Link>
        <Link
          to={`/onboarding/sign-up/employer-settings`}
          className="text-purple-200 text-xs"
        >
          Settings
        </Link>
      </ul>

      <button
        onClick={handleSignOut}
        className="text-purple-200 text-xs bg-transparent border-none cursor-pointer"
      >
        Sign Out
      </button>
    </div>
  );
};

export default EmployerNavbar;
