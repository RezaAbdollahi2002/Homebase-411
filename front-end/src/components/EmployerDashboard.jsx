import EmployerNavbar from "./EmployerNavbar";
import Message from "./Message";

const EmployerDashboard = ({ message }) => {
  return (
    <div className="bg-gray-200 min-h-screen p-4">
      {/* Main dashboard content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`bg-white rounded-xl p-4 shadow col-span-3`}>
          <h2 className="font-bold text-xl mb-2">Employer Dashboard Content</h2>
          {/* Your dashboard content goes here */}
        </div>

        {/* Message panel */}
        {message && (
          <div className="col-span-1 bg-white rounded-xl p-4 shadow max-w-[400px]">
            <Message />
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerDashboard;
