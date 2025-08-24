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

  const [companyId, setCompanyId] = useState(null); // initially null
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
    watch,
  } = useForm({
    defaultValues: {
      firstName: signupData.firstName || "",
      lastName: signupData.lastName || "",
      phoneNumber: signupData.phoneNumber || "",
      email: signupData.email || "",
      company_id: companyId || "",
      otp: "",
    },
  });

  // Fetch company ID once on mount
  useEffect(() => {
    const fetchCompanyId = async () => {
      try {
        const res = await axios.get("/api/company/generate-companyid");
        setCompanyId(res.data.company_id);
      } catch (err) {
        console.error("Failed to fetch company ID:", err);
      }
    };
    fetchCompanyId();
  }, []);

  // Debug log for updated companyId
  useEffect(() => {
    if (companyId !== null) console.log("Fetched companyId:", companyId);
  }, [companyId]);

  // Reset form if reviewing
  useEffect(() => {
    if (formReview) {
      reset({
        firstName: signupData.firstName || "",
        lastName: signupData.lastName || "",
        phoneNumber: signupData.phoneNumber || "",
        email: signupData.email || "",
        company_id: signupData.companyId || companyId || "",
      });
    }
  }, [formReview, signupData, reset, companyId]);

  // Check if email or phone exists
  const checkEmailAndPhone = async (email, phoneNumber) => {
    try {
      const response = await axios.get("/api/employer-signup-phonenumber-email-check", {
        params: { phone_number: phoneNumber , email},
      });
      return response.data; // { email_exists: bool, phone_exists: bool }
    } catch (err) {
      console.error("Error checking email/phone", err);
      return null;
    }
  };

  // Send OTP
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

  // Verify OTP
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

  // Form submission
  const onSubmit = async (data) => {
    if (!companyId) return alert("Company ID is not ready. Please wait.");
    
    const { email, phoneNumber } = data;
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
    if (hasErrors) return;

    if (!otpVerified) return alert("Please verify your email OTP");

    // Include the fetched companyId in the final data
    const finalData = { ...data, company_id: companyId };
    updateSignupData(finalData);

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

      {/* Hidden company_id */}
      <input type="hidden" {...register("company_id")} value={companyId?.toString() || ""} />

      {/* Submit */}
      <button
        type="submit"
        className="mt-4 bg-purple-700 text-white px-6 py-2 rounded-lg hover:bg-purple-800 transition duration-150"
        disabled={companyId === null}
      >
        Next
      </button>
    </form>
  );
};

export default OwnerSignupForm;
