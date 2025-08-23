import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSignup } from "./EmployeeSignupContext";
import axios from "axios";

const OwnerSignupForm = () => {
  const navigate = useNavigate();
  const { signupData, updateSignupData } = useSignup();
  const location = useLocation();
  const formReview = location.state?.formReview || false;

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    watch,
    reset,
  } = useForm({
    defaultValues: {
      firstName: signupData.firstName || "",
      lastName: signupData.lastName || "",
      phoneNumber: signupData.phoneNumber || "",
      email: signupData.email || "",
      company_id: signupData.company_id || "",
      otp: "",
    },
  });

  const checkCompanyId = async (company_id) => {
    try {
      const response = await axios.get("/api/employer-signup-companyid-check", {
        params: { company_id },
      });
      return response.data; // expects { companyid_exists: boolean }
    } catch (err) {
      console.error("Error checking company_id", err);
      return null;
    }
  };

  const checkEmailAndPhone = async (email, phoneNumber) => {
    try {
      const response = await axios.get("/api/employer-signup-phonenumber-email-check", {
        params: { email, phone_number: phoneNumber },
      });
      return response.data;
    } catch (err) {
      console.error("Error checking email/phone", err);
      return null;
    }
  };

  useEffect(() => {
    if (formReview) {
      reset({
        firstName: signupData.firstName || "",
        lastName: signupData.lastName || "",
        phoneNumber: signupData.phoneNumber || "",
        email: signupData.email || "",
        company_id: signupData.company_id || "",
      });
    }
  }, [formReview, signupData, reset]);

  // ====== OTP FUNCTIONS ======
  const sendOtp = async () => {
    const email = watch("email");
    if (!email) return alert("Enter an email first");
    try {
      const res = await axios.post("http://localhost:8000/send-otp/", { email });
      alert(res.data.message);
      setOtpSent(true);
    } catch (err) {
      console.error(err);
      alert("Failed to send OTP");
    }
  };

  const verifyOtp = async (otp) => {
    const email = watch("email");
    if (!otp) return alert("Enter the OTP");
    try {
      const res = await axios.post("http://localhost:8000/verify-otp/", {
        email,
        otp: otp.trim(),
      });
      if (res.data.success) {
        alert("OTP verified successfully");
        setOtpVerified(true);
      } else {
        alert(res.data.message || "Invalid OTP");
        setOtpVerified(false);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to verify OTP");
      setOtpVerified(false);
    }
  };

  const onSubmit = async (data) => {
    const { email, phoneNumber, company_id } = data;

    // Check email & phone
    const result = await checkEmailAndPhone(email, phoneNumber);

    let hasErrors = false;

    if (result?.email_exists) {
      setError("email", { type: "manual", message: "Email is already registered" });
      hasErrors = true;
    }
    if (result?.phone_exists) {
      setError("phoneNumber", { type: "manual", message: "Phone number is already registered" });
      hasErrors = true;
    }

    // Check company_id
    if (company_id) {
      const companyResult = await checkCompanyId(company_id);
      if (companyResult?.companyid_exists) {
        setError("company_id", { type: "manual", message: "Company ID is already registered" });
        hasErrors = true;
      }
    }

    if (hasErrors) return;

    // Ensure OTP verified
    if (!otpVerified) return alert("Please verify your email OTP");

    updateSignupData(data);

    if (formReview) {
      navigate("/onboarding/sign-up/business-info/finalize-create-owner-account");
    } else {
      navigate("/onboarding/sign-up/owner-motivation");
    }
  };

  return (
    <form className="px-4 py-4" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-lg md:text-xl font-bold py-2 text-left">General information</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* First Name */}
        <div>
          <p className="text-medium py-1">First name</p>
          <input
            type="text"
            placeholder="John"
            {...register("firstName", { required: "First name is required" })}
            className="input border border-gray-400 px-2 rounded-sm outline-none focus:no-outline"
          />
          {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
        </div>

        {/* Last Name */}
        <div>
          <p className="text-medium py-1">Last name</p>
          <input
            type="text"
            placeholder="Smith"
            {...register("lastName", { required: "Last name is required" })}
            className="input border border-gray-400 px-2 rounded-sm outline-none focus:no-outline"
          />
          {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
        </div>

        {/* Email */}
        <div className="my-2">
          <p className="text-medium py-1">Email</p>
          <input
            type="email"
            placeholder="example@gmail.com"
            {...register("email", { required: "Email is required" })}
            className="input border border-gray-400 px-2 rounded-sm outline-none focus:no-outline"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>

        {/* Phone */}
        <div className="my-2">
          <p className="text-medium py-1">Phone number</p>
          <input
            type="tel"
            placeholder="1234567890"
            {...register("phoneNumber", {
              required: "Phone number is required",
              pattern: { value: /^[0-9]{10}$/, message: "Phone number must be 10 digits" },
            })}
            className="input border border-gray-400 px-2 rounded-sm outline-none focus:no-outline"
          />
          {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber.message}</p>}
        </div>

        {/* Company ID */}
        <div className="my-2">
          <p className="text-medium py-1">Company ID</p>
          <input
            type="text"
            placeholder="2"
            {...register("company_id")}
            className="input border border-gray-400 px-2 rounded-sm outline-none focus:no-outline"
          />
          {errors.company_id && <p className="text-red-500 text-sm">{errors.company_id.message}</p>}
        </div>
      </div>

      {/* OTP Section */}
      {otpSent && (
        <div className="my-2">
          <p className="text-medium py-1">OTP</p>
          <input
            type="text"
            placeholder="Enter OTP"
            {...register("otp")}
            className="input border border-gray-400 px-2 rounded-sm outline-none focus:no-outline"
          />
          <button
            type="button"
            onClick={() => verifyOtp(watch("otp"))}
            className="bg-green-500 text-white px-4 py-1 rounded-lg mt-2 hover:bg-green-600"
          >
            Verify OTP
          </button>
        </div>
      )}

      {/* Send OTP */}
      <button
        type="button"
        onClick={sendOtp}
        className="bg-blue-500 text-white px-4 py-1 rounded-lg mt-2 hover:bg-blue-600"
      >
        Send OTP
      </button>

      {/* Submit */}
      <button
        type="submit"
        className="mt-4 bg-purple-700 text-white px-6 py-2 rounded-lg hover:bg-purple-800 transition duration-150"
      >
        Next
      </button>
    </form>
  );
};

export default OwnerSignupForm;
