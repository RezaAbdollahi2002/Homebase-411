import { useForm } from "react-hook-form";
import { Typewriter } from "react-simple-typewriter";
import { useSignup } from "./EmployeeSignupContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

const UserContactInfoSignup = () => {
  const { signupData, updateSignupData } = useSignup();
  const location = useLocation();
  const fromReview = location.state?.fromReview || false;
  const navigate = useNavigate();

  const [emailExists, setEmailExists] = useState(false);
  const [phoneExists, setPhoneExists] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      phoneNumber: signupData.phoneNumber || "",
      email: signupData.email || "",
      otp: "",
    },
  });

  // Check phone/email uniqueness
  const checkUniqueness = async (email, phoneNumber) => {
    try {
      const res = await fetch(
        `/api/checks/employee-signup-phonenumber-email-check?email=${encodeURIComponent(
          email
        )}&phone_number=${encodeURIComponent(phoneNumber)}`,
        { method: "GET" }
      );
      const data = await res.json();
      setEmailExists(data.email_exists);
      setPhoneExists(data.phone_exists);
    } catch (error) {
      console.error("Error checking uniqueness", error);
    }
  };

  // Send OTP
  const sendOtp = async () => {
    const email = watch("email");
    if (!email) return alert("Enter an email first");
    try {
      const res = await fetch("http://localhost:8000/send-otp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      alert(data.message);
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
      const res = await fetch("http://localhost:8000/verify-otp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (data.success) {
        alert("OTP verified successfully");
        setOtpVerified(true);
      } else {
        alert(data.message || "Invalid OTP");
        setOtpVerified(false);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to verify OTP");
      setOtpVerified(false);
    }
  };

  const onSubmit = async (data) => {
    // 1. Check uniqueness
    await checkUniqueness(data.email, data.phoneNumber);
    if (emailExists || phoneExists) return;

    // 2. Ensure OTP verified
    if (!otpVerified) return alert("Please verify your email OTP");

    // 3. Save data and navigate
    updateSignupData(data);
    if (fromReview) {
      navigate("/onboarding/sign-up/user-account-edit-checking");
    } else {
      navigate("/onboarding/sign-up/user-accountuser");
    }
  };

  return (
    <div className="min-h-screen w-full px-4 md:px-10 py-12 bg-gradient-to-br from-[#9480b3] via-[#30293a] to-[#D473FF]">
      <h1 className="hidden lg:block text-xl md:text-3xl xl:text-4xl text-white font-semibold mb-6">
        <Typewriter
          words={["homebase", "Homebase"]}
          loop
          cursor
          cursorStyle="_"
          typeSpeed={100}
          deleteSpeed={70}
          delaySpeed={1000}
        />
      </h1>

      <div className="bg-white text-black border border-gray-400 shadow-2xl px-6 py-8 max-w-2xl mx-auto rounded-sm grid gap-y-4">
        <p className="mx-auto my-2">STEP 2 OF 4</p>
        <h1 className="text-center font-bold text-2xl lg:text-3xl mb-6">
          Contact Information
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-y-4">
          {/* Phone Number */}
          <label htmlFor="phoneNumber" className="text-sm">Phone Number</label>
          <input
            id="phoneNumber"
            type="text"
            {...register("phoneNumber", {
              required: "Phone number is required",
              pattern: { value: /^[0-9]{10}$/, message: "Phone number must be 10 digits" },
            })}
            onBlur={() => checkUniqueness(watch("email"), watch("phoneNumber"))}
            placeholder="Phone Number"
            className="input border border-gray-400 rounded-lg px-2 hover:border-gray-600"
          />
          {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber.message}</p>}
          {phoneExists && <p className="text-red-500 text-sm">Phone number already exists</p>}

          {/* Email */}
          <label htmlFor="email" className="text-sm">Email</label>
          <input
            id="email"
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email address" },
            })}
            onBlur={() => checkUniqueness(watch("email"), watch("phoneNumber"))}
            placeholder="youremail@gmail.com"
            className="input border border-gray-400 rounded-lg px-2 hover:border-gray-600"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          {emailExists && <p className="text-red-500 text-sm">Email already exists</p>}

          {/* OTP */}
          {otpSent && (
            <>
              <label htmlFor="otp" className="text-sm">OTP</label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                {...register("otp", {
                  required: "OTP is required",
                  pattern: { value: /^[0-9]{6}$/, message: "OTP must be 6 digits" },
                })}
                placeholder="Enter OTP"
                className="input border border-gray-400 rounded-lg px-2 hover:border-gray-600"
              />
              {errors.otp && <p className="text-red-500 text-sm">{errors.otp.message}</p>}
              <button
                type="button"
                onClick={() => verifyOtp(watch("otp"))}
                className="bg-green-500 text-white px-4 py-1 rounded-lg hover:bg-green-600 mt-2"
              >
                Verify OTP
              </button>
            </>
          )}

          {/* Send OTP */}
          <button
            type="button"
            onClick={sendOtp}
            disabled={otpSent}
            className={`bg-blue-500 text-white px-4 py-1 rounded-lg mt-2 ${otpSent ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
          >
            Send OTP
          </button>

          {/* Next */}
          <button
            type="submit"
            className="mt-6 bg-purple-700 text-white px-6 py-2 rounded-lg hover:bg-purple-800 transition duration-150"
          >
            Next
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserContactInfoSignup;
