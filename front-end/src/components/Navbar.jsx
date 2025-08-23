import { Link, useNavigate } from "react-router-dom";
import { use, useState } from "react";
import { set } from "date-fns";

const Navbar = ({messageState}) => {
  const navigate = useNavigate();
  const [message,setMessages] = useState(false);

  const handleSignOut = () => {
    // TODO: Add your sign out logic here, e.g. clearing tokens/localStorage
    
    const confirm = window.confirm("Are you sure you want to sign out?")
    if(!confirm) return;

    console.log("Signing out...");
    // Redirect to login or home page after sign out
    navigate("/accounts/sign-in"); 
  };
  const messageStateFunction = () => {
    setMessages(!message);
    messageState(message)
  }

  return (
    <>
      <div className="flex px-2 bg-purple-950 w-full py-2 items-center justify-between">
        <ul className="flex gap-3 items-center">
          <Link
          to={"/onboarding/sign-up/employee-dashboard"}
          className="text-white mx-2 font-bold text-sm">Homebase</Link>
          <Link 
          to={'/onborading/Schedule'}
          className="text-purple-200 text-xs">Schedule</Link>
          <Link 
          //  to={`/onborading/sign-up/message`}
          onClick={messageStateFunction}
          className="text-purple-200 text-xs">Message</Link>
          <Link 
          to={`/onborading/sign-up/team`}
          className="text-purple-200 text-xs">Team</Link>
          <Link
            to={`/onboarding/sign-up/employee-settings`}
            className="text-purple-200 text-xs"
          >
            Settings
          </Link>
        </ul>
        {/* Sign Out link aligned right */}
        <button
          onClick={handleSignOut}
          className="text-purple-200 text-xs bg-transparent border-none cursor-pointer"
        >
          Sign Out
        </button>
      </div>
    </>
  );
};

export default Navbar;
