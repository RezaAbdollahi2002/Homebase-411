import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const schema = yup.object().shape({
  newPassword: yup
    .string()
    .required("New password is required")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&])[A-Za-z\d@#$!%*?&]{8,}$/,
      "Password must be at least 8 characters, include uppercase, lowercase, number, and special character."
    ),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Passwords do not match")
    .required("Please confirm your password"),
});

const EmployerPasswordAndSecurity = () => {
  const [employerId, setEmployerId] = useState("");
  const [mode, setMode] = useState("view");
  const [currentPasswordMasked] = useState("******");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const storedId = localStorage.getItem("employer_id");
    if (storedId) setEmployerId(storedId);
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage("");
    setServerError("");

    try {
      const response = await fetch(
        `/api/employer/settings/${employerId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ new_password: data.newPassword }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update password");
      }

      const responseData = await response.json();
      setMessage(responseData.response || "Password updated successfully");
      reset();
      setMode("view");
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md lg:mx-1 mx-auto mt-10 p-6 border rounded shadow-md bg-white">
      <h2 className="text-2xl font-semibold mb-6">Password & Security</h2>

      {message && (
        <div className="mb-4 p-3 text-green-700 bg-green-100 border border-green-300 rounded">
          {message}
        </div>
      )}

      {serverError && (
        <div className="mb-4 p-3 text-red-700 bg-red-100 border border-red-300 rounded">
          {serverError}
        </div>
      )}

      {mode === "view" && (
        <>
          
          <button
            onClick={() => {
              setMode("change");
              setMessage("");
              setServerError("");
              reset();
            }}
            className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Change Password
          </button>
        </>
      )}

      {mode === "change" && (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-4 relative">
            <label
              htmlFor="newPassword"
              className="block mb-1 font-medium text-gray-700"
            >
              New Password
            </label>
            <input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              {...register("newPassword")}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                errors.newPassword
                  ? "focus:ring-red-500 border-red-500"
                  : "focus:ring-blue-500"
              }`}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-2 top-8 text-gray-600 hover:text-gray-900"
              aria-label={showNewPassword ? "Hide new password" : "Show new password"}
              tabIndex={-1}
            >
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.newPassword && (
              <p className="mt-1 text-red-600 text-sm">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="mb-6 relative">
            <label
              htmlFor="confirmPassword"
              className="block mb-1 font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                errors.confirmPassword
                  ? "focus:ring-red-500 border-red-500"
                  : "focus:ring-blue-500"
              }`}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2 top-8 text-gray-600 hover:text-gray-900"
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              tabIndex={-1}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.confirmPassword && (
              <p className="mt-1 text-red-600 text-sm">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading || !isValid}
              className={`flex-1 py-2 px-4 text-white font-semibold rounded ${
                loading
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("view");
                reset();
                setServerError("");
                setMessage("");
              }}
              className="flex-1 py-2 px-4 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EmployerPasswordAndSecurity;
