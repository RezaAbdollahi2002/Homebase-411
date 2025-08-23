import React, { useState,useEffect } from "react";
import { useSignup } from "./EmployeeSignupContext";
import { useNavigate } from "react-router-dom";
import { Typewriter } from "react-simple-typewriter";
import axios from "axios";
import { useForm } from "react-hook-form";

const FinalizeOwnerAccount = () => {
  const navigate = useNavigate();
  const { signupData, updateSignupData } = useSignup();  // All collected data from previous steps
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: {errors}
  } = useForm()

    useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "Your information might not be saved if you leave or refresh this page.";
      return e.returnValue;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

const checkCompany = async (companyPayload) => {
  try {
    const response = await axios.get("/api/check_company", {
      params: {
        name: companyPayload.name,
        kind: companyPayload.kind,
        primary_location: companyPayload.primary_location,
        open_date: companyPayload.open_date,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error checking company:", error);
    throw error;
  }
};


const mapSignupData = async () => {
  setIsSubmitting(true);
  setError(null);

  try {
    const companyPayload = {
      name: signupData.BusinessName,
      kind: signupData.BusinessType,
      primary_location: signupData.primary_address,
      number_of_employees: signupData.NumberOfEmployees,
      number_of_locations: signupData.MultipleLocations,
      open_date: signupData.open_date,
      selected_services: signupData.selected_services,
    };

    // 🔹 Step 1: Check if company already exists
    const checkResult = await checkCompany(companyPayload);

    if (checkResult.name_exists) {
      setError("A company with this name already exists.");
      setIsSubmitting(false);
      return;
    }
    if (checkResult.primary_location_exists) {
      setError("A company with this primary location already exists.");
      setIsSubmitting(false);
      return;
    }
    if (checkResult.kind_exists) {
      setError("A company of this kind already exists.");
      setIsSubmitting(false);
      return;
    }
    if (checkResult.open_date_exists) {
      setError("A company with this open date already exists.");
      setIsSubmitting(false);
      return;
    }

    // 🔹 Step 2: Proceed with normal signup flow
    const companyResponse = await axios.post("/api/company-signup", companyPayload);
    const companyId = companyResponse.data.employer_id;

    const employerPayload = {
      first_name: signupData.firstName,
      last_name: signupData.lastName,
      company_id: companyId,
      email: signupData.email,
      phone_number: signupData.phoneNumber,
      username: signupData.username,
      password: signupData.password,
    };

    await axios.post("/api/employer-signup", employerPayload);

    setSuccess(true);
    navigate("/accounts/sign-in");

  } catch (err) {
    console.error("Full error response:", err.response?.data);
    setError(err.response?.data?.detail || "Something went wrong.");
  } finally {
    setIsSubmitting(false);
  }
};




  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-500 to-gray-300 px-8 py-10">
        <span className="hidden sm:inline md:font-bold text-purple-800 text-lg md:text-xl lg:text-2xl xl:text-3xl ">
          <Typewriter
            words={['Homebase']}
            loop
            cursor
            cursorStyle="_"
            typeSpeed={120}
            deleteSpeed={50}
            delaySpeed={1000}
          />
        </span>
        {error && (
          <p className="text-red-600 mt-2">{error}</p>
        )}

        <form onSubmit={handleSubmit(mapSignupData)} className="border shadow-xl shadow-white-200  border-white max-w-[650px] mt-15 mx-auto my-auto px-4 py-5 bg-gray-200 xl:mt-10 rounded-sm">
          <h1 className="text-xl md:text-2xl font-bold text-center mb-6">Edit or Confirm</h1>
          <div>
            <div className="flex justify-between mb-2">
              <h1 className="text-lg md:text-xl font-semibold">General Information</h1>
              <button
                type="button"
                onClick={() => { navigate("/onboarding/sign-up/owner-info", { state: { formReview: true } }); }}
                 className="text-sm border px-2 rounded-sm border-white text-white bg-purple-700 hover:text-lg hover:font-semibold duration-300"
              >
                Edit
              </button>
            </div>

            <p className="text-sm md:text-medium">First name : {signupData.firstName || "Not provided"}</p>
            <p className="text-sm md:text-medium">Last name : {signupData.lastName || "Not provided"}</p>
            <p className="text-sm md:text-medium">Email : {signupData.email || "Not provided"}</p>
            <p className="text-sm md:text-medium">Phone number : {signupData.phoneNumber || "Not provided"}</p>

            <hr className="my-4 border-t border-gray-400" />

            <div className="flex justify-between py-2">
              <h1 className="text-lg md:text-xl font-semibold">Selected Service and Open Duration</h1>
              <button
                type="button"
                onClick={() => { navigate("/onboarding/sign-up/owner-motivation" , { state: { formState: true } }); }}
                className="text-sm border px-2 rounded-sm border-white text-white bg-purple-700 hover:text-lg hover:font-semibold duration-300"
              >
                Edit
              </button>
            </div>
            <p className="text-sm md:text-medium">Selected service : {signupData.selected_services || "Not provided"}</p>
            <p className="text-sm md:text-medium">Open Duration : {signupData.open_date || "Not provided"}</p>

            <hr className="my-4 border-t border-gray-400" />

            <div className="flex justify-between py-2">
              <h1 className="text-lg md:text-xl font-semibold">Business Information</h1>
              <button
                type="button"
                onClick={() => { navigate("/onboarding/sign-up/business-info" , { state: { formState: true } }); }}
                className="text-sm border px-2 rounded-sm border-white text-white bg-purple-700 hover:text-lg hover:font-semibold duration-300"
              >
                Edit
              </button>
            </div>
            <p className="text-sm md:text-medium">Name : {signupData.BusinessName || "Not provided"}</p>
            <p className="text-sm md:text-medium">Kind : {signupData.BusinessType || "Not provided"}</p>
            <p className="text-sm md:text-medium">Number of employees : {signupData.NumberOfEmployees || "Not provided"}</p>
            <p className="text-sm md:text-medium">Number of locations : {signupData.MultipleLocations || "Not provided"}</p>
            <p className="text-sm md:text-medium">Primary locations : {signupData.primary_address || "Not provided"}</p>

            <hr className="my-4 border-t border-gray-400" />

            <div className="flex justify-between py-2">
              <h1 className="text-lg md:text-xl font-semibold">Account Information</h1>
              <button
                type="button"
                onClick={() => { navigate("/onboarding/sign-up/business-info/create-owner-account" , { state: { formReview: true } }); }}
                className="text-sm border px-2 rounded-sm border-white text-white bg-purple-700 hover:text-lg hover:font-semibold duration-300"
              >
                Edit
              </button>
            </div>
            <p className="text-sm md:text-medium">username : {signupData.username || "Not provided"}</p>

            <div className="text-right">
              <button
            type="submit"
            className="text-lg md:text-xl border border-gray-400 rounded-sm px-2 mt-2 bg-purple-700 text-white py-1 hover:bg-gray-300 hover:text-black duration-200"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Confirm"}
          </button>

            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default FinalizeOwnerAccount;
