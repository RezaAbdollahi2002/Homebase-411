import React from "react";
import { useForm } from "react-hook-form";
import { Typewriter } from "react-simple-typewriter";
import { useNavigate } from "react-router-dom";
import { useSignup } from "./EmployeeSignupContext";

const UserAccountinfo = () => {
  const { signupData, updateSignupData } = useSignup();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      userName: signupData.userName || "",
      password: signupData.password || "",
      // confirmPassword is not set here because it's just for validation
    },
  });

  const onSubmit = (data) => {
    // Only send userName and password, exclude confirmPassword
    updateSignupData({
      userName: data.userName,
      password: data.password,
    });
    
    navigate("/onboarding/sign-up/user-account-edit-checking");
   
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

      <div className="bg-white text-black border border-gray-400 shadow-2xl px-6 py-8 max-w-2xl mx-auto rounded-sm grid">
        <p className="mx-auto my-2">STEP 3 OF 4</p>
        <h1 className="text-center font-bold text-2xl lg:text-3xl mb-6">Sign Up</h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-x-6 gap-y-4 px-2 md:px-4"
          noValidate
        >
          <h2 className="text-lg font-semibold mb-3">Account Information</h2>

          {/* Username */}
          <label htmlFor="userName" className="block mb-1 text-sm">
            Username
          </label>
          <input
            id="userName"
            type="text"
            {...register("userName", {
              required: "Username is required",
              minLength: {
                value: 4,
                message: "Username must be at least 4 characters",
              },
              maxLength: {
                value: 20,
                message: "Username must be no more than 20 characters",
              },
              pattern: {
                value: /^[a-zA-Z0-9_.]+$/,
                message:
                  "Username can only contain letters, numbers, and _ or .",
              },
              validate: async (value) => {
                if (!value) return "Username is required";
                try {
                  const res = await fetch(
                    `/api/employee-signup-username-check?username=${encodeURIComponent(
                      value
                    )}`
                  );
                  if (!res.ok) throw new Error("Network error");
                  const data = await res.json();
                  return data.exists
                    ? "Username is already taken"
                    : true;
                } catch (error) {
                  return "Failed to validate username availability";
                }
              },
            })}
            placeholder="Username"
            className={`input border rounded-lg px-2 hover:border-gray-600 ${
              errors.userName ? "border-red-500" : "border-gray-400"
            }`}
            disabled={isSubmitting}
          />
          {errors.userName && (
            <p className="text-red-500 text-sm">{errors.userName.message}</p>
          )}

          {/* Password */}
          <label htmlFor="password" className="block mt-3 mb-1 text-sm">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
                pattern: {
                  value:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&])[A-Za-z\d@#$!%*?&]{8,}$/,
                  message:
                    "Password must contain uppercase, lowercase, number, and special character",
                },
              })}
              placeholder="Password"
              className={`input  w-full border rounded-lg px-2 pr-10 hover:border-gray-600 ${
                errors.password ? "border-red-500" : "border-gray-400"
              }`}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-gray-600"
              tabIndex={-1}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}

          {/* Confirm Password */}
          <label htmlFor="confirmPassword" className="block mt-3 mb-1 text-sm">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === watch("password") || "Passwords do not match",
              })}
              placeholder="Confirm Password"
              className={`input w-full border rounded-lg px-2 pr-10 hover:border-gray-600 ${
                errors.confirmPassword ? "border-red-500" : "border-gray-400"
              }`}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-gray-600"
              tabIndex={-1}
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 bg-purple-700 text-white px-6 py-2 rounded-lg hover:bg-purple-800 transition duration-150 disabled:opacity-50"
          >
            {isSubmitting ? "Checking..." : "Next"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserAccountinfo;
