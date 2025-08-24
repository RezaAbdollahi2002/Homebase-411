import { useSignup } from "./EmployeeSignupContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState, useCallback } from "react";

const mapSignupDataToBackend = (data) => ({
  first_name: data.firstName,
  last_name: data.lastName,
  dob: data.dob,
  employer_id: data.employer_id,
  phone_number: data.phoneNumber,
  address: data.address,
  email: data.email,
  username: data.userName,
  password: data.password,
});

const UserCheckingAccountInfo = () => {
  const { signupData } = useSignup();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleFinalSubmit = useCallback(async () => {
    if (loading) return;

    if (
      !signupData.firstName ||
      !signupData.lastName ||
      !signupData.email ||
      !signupData.password ||
      !signupData.phoneNumber ||
      !signupData.employer_id
    ) {
      setErrorMessage("Please fill all required fields.");
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    try {
      const payload = mapSignupDataToBackend(signupData);
      const response = await axios.post("/api/employee-signup", payload);
      navigate("/accounts/sign-in");
    } catch (error) {
      const message = error.response?.data?.detail || "Signup failed. Please check your input and try again.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }, [loading, navigate, signupData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d2c3e9] via-[#5d4b77] to-[#412e49] px-4 py-10">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-8">
          <h1 className="text-3xl font-bold text-center text-purple-800 mb-6">Review & Confirm</h1>

          {/* General Information */}
          <section className="mb-6 border-b pb-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-800">General Information</h2>
              <button
                className="text-sm text-purple-700 hover:underline"
                onClick={() =>
                  navigate("/onboarding/sign-up/user-info", { state: { fromReview: true } })
                }
              >
                Edit
              </button>
            </div>
            <p><strong>First Name:</strong> {signupData.firstName}</p>
            <p><strong>Last Name:</strong> {signupData.lastName}</p>
            <p><strong>Date of Birth:</strong> {signupData.dob}</p>
            <p><strong>Employer ID:</strong> {signupData.employer_id}</p>
          </section>

          {/* Contact Information */}
          <section className="mb-6 border-b pb-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-800">Contact Information</h2>
              <button
                className="text-sm text-purple-700 hover:underline"
                onClick={() =>
                  navigate("/onboarding/sign-up/user-contact", { state: { fromReview: true } })
                }
              >
                Edit
              </button>
            </div>
            <p><strong>Phone Number:</strong> {signupData.phoneNumber}</p>
            <p><strong>Email:</strong> {signupData.email}</p>
          </section>

          {/* Account Information */}
          <section className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-800">Account Information</h2>
              <button
                className="text-sm text-purple-700 hover:underline"
                onClick={() =>
                  navigate("/onboarding/sign-up/user-accountuser", { state: { fromReview: true } })
                }
              >
                Edit
              </button>
            </div>
            <p><strong>Username:</strong> {signupData.userName}</p>
            <p><strong>Password:</strong> ••••••••</p>
          </section>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
              {errorMessage}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              onClick={handleFinalSubmit}
              disabled={loading}
              className={`w-full sm:w-auto px-6 py-2 font-medium rounded text-white transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin w-5 h-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCheckingAccountInfo;
