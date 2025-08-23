import { useSignup } from "./EmployeeSignupContext";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const CreateOwnerAccount = () => {
  const { signupData,updateSignupData } = useSignup();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const location = useLocation();
  const formReview = location.state?.formReview || false;

  // Function to check if username exists via API call
  const checkUsername = async (username) => {
    try {
      const response = await axios.get("/api/employer-signup-username-check", {
        params: { username },
      });
      return response.data; // expected: { username_exists: true/false }
    } catch (error) {
      console.error("Error checking username:", error);
      return null;
    }
  };

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      username: "",
      password: "",
      sendAppLink: false,
    },
  });

  useEffect(()=>{
    if(formReview) {
      reset(
        {
          username: signupData.username || ""
                }
      )
    }
  }, [formReview, signupData, reset])

  const onSubmit = async (data) => {
    // Final username check on submit (optional since onBlur does it)
    const usernameCheck = await checkUsername(data.username);
    if (usernameCheck?.exists) {
      setError("username", {
        type: "manual",
        message: "Username is already taken",
      });
      return; // prevent form submission
    }

    const { confirmPassword, ...dataToSave } = data;
    updateSignupData(dataToSave);

    
      navigate("/onboarding/sign-up/business-info/finalize-create-owner-account");
     
  };

  const passwordValue = watch("password");

  return (

    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-gray-950 via-gray-500 to-gray-300 px-8 py-10">
      <h1 className="hidden sm:inline text-purple-800 font-bold text-lg md:text-xl lg:text-2xl xl:text-3xl">Homebase</h1>
      <div className="border border-sm border-gray-400 shadow-5xl shadow-gray-600 rounded-2xl bg-gray-100 max-w-[700px] mx-auto my-auto px-10 py-10 items-center">
        
        <p className="mx-auto text-sm font-semibold text-center mb-2">STEP 4 OF 5</p>
        <h1 className="font-bold text-lg md:text-xl lg:text-2xl xl:text-5xl text-center mb-2">
          Finish signing up
        </h1>
        <p className="text-sm">Reza, you're about to join 100,000+ businesses that are already loving Homebase.</p>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Username */}
          <p className="text-lg font-bold md:text-xl mt-2">Username</p>
          <input
          type="text"
          {...register("username", {
            required: "Username is required",
            minLength: {
              value: 8,
              message: "Username must be at least 8 characters",
            },
            pattern: {
              value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d._]{8,}$/,
              message:
                "Username must be at least 8 characters and include letters, numbers, underscores, or dots",
            },
            onBlur: async (e) => {
              const username = e.target.value.trim();
              if (username) {
                const result = await checkUsername(username);
                if (result?.username_exists) {
                  setError("username", {
                    type: "manual",
                    message: "Username is already taken",
                  });
                } else {
                  clearErrors("username");
                }
              }
            },
          })}
          className={`border w-full no-outline border-gray-400 rounded-sm px-2 py-1 bg-gray-100 my-2 text-purple-950 ${
            errors.username ? "border-red-500" : ""
          }`}
          placeholder="your username"
        />
        {
          errors.username && (<p className="text-red-500 text-sm mt-1">{errors.username.message}</p>)
        }

          {/* Password */}
          <p className="text-lg font-bold md:text-xl mt-2">Password</p>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="*********"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 8, message: "Password must be at least 8 characters" },
                pattern: {
                  value: /^(?=.*\d).+$/,
                  message: "Password must contain at least 1 number",
                },
              })}
              className={`border w-full no-outline border-gray-400 rounded-sm px-2 py-1 bg-gray-100 my-2 text-purple-950 ${
                errors.password ? "border-red-500" : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-purple-700 hover:text-purple-900 focus:outline-none"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
          <p className="text-sm md:text-sm text-gray-800">
            Must be at least 8 characters, with 1 number
          </p>

          {/* Confirm Password */}
          <p className="text-lg font-bold md:text-xl mt-4">Confirm Password</p>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="*********"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === passwordValue || "Passwords do not match",
              })}
              className={`border w-full no-outline border-gray-400 rounded-sm px-2 py-1 bg-gray-100 my-2 text-purple-950 ${
                errors.confirmPassword ? "border-red-500" : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-purple-700 hover:text-purple-900 focus:outline-none"
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}

          {/* Send app link checkbox */}
          <div className="flex items-center mt-2">
            <input
              id="sendAppLink"
              type="checkbox"
              {...register("sendAppLink")}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="sendAppLink" className="ml-2 text-gray-800">
              Send me a link to try the mobile app
            </label>
          </div>

          <button
            type="submit"
            className="w-full text-lg font-semibold border-gray-400 py-2 bg-gray-200 rounded-xl my-4 hover:bg-purple-700 hover:text-white"
          >
            Continue to Review
          </button>

          <p className="text-xs text-gray-700">
            You may receive text messages related to your account setup. Message & data
            rates may apply. Message frequency varies. Reply STOP to cancel messages.
          </p>
        </form>
      </div>
    </div>
  );
};

export default CreateOwnerAccount;
