import React, { useState } from 'react';
import Register_image_homepage from '../images/register_homebase_images.png';
import { EnvelopeIcon, LockClosedIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();

  // State variables for input and UI feedback
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  if (!username || !password) {
    setError('Please enter both email and password.');
    setLoading(false);
    return;
  }

  try {
    const response = await fetch('http://localhost:8000/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Sign in failed');
    }

    const data = await response.json();

    // Safely store IDs
    if (data.employee_id) {
      localStorage.setItem("employee_id", data.employee_id.toString());
    } else {
      localStorage.removeItem("employee_id");
    }

    if (data.employer_id) {
      localStorage.setItem("employer_id", data.employer_id.toString());
    } else {
      localStorage.removeItem("employer_id");
    }

    localStorage.setItem('access_token', data.access_token);

    // Navigate based on role
    if (data.role === "employee") {
      navigate('/onboarding/sign-up/employee-dashboard');
    } else if (data.role === "employer") {
      console.log("EmployerId:" , data.employer_id.toString())
      navigate('/onboarding/sign-up/employer-dashborad');
    } else {
      setError("Unknown user role");
    }

  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="grid grid-cols-1 min-h-screen md:grid-cols-2 bg-gradient-to-br from-[#2B0D59] via-[#5E1FBF] to-[#D473FF]">
      {/* Left */}
      <div className="flex flex-col justify-between px-6 py-10">
        <h1 className="font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-white mb-4">homebase</h1>
        <div className="flex justify-center items-center">
          <img
            src={Register_image_homepage}
            alt="register_image"
            className="max-w-[90%] md:max-w-[500px] h-auto drop-shadow-xl"
          />
        </div>

        <div className="mb-15">
          <h1 className="font-semibold text-lg md:text-xl lg:text-2xl xl:text-3xl text-white mb-3">AI Assistants are here.</h1>
          <p className="text-white wrap-normal leading-relaxed text-base md:text-lg">
            Fast, reliable, and built to save you more time than ever. Seriously lighten your workload with new Hiring
            and Scheduling assistants that do the work for you.
          </p>
        </div>
      </div>

      {/* Right Side: Sign-In Form */}
      <div className="bg-white flex flex-col justify-center h-full w-full px-10 py-16">
        <div className="max-w-[400px] w-full mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Sign in</h2>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 bg-gray-50 hover:border-purple-900 duration-75">
                <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="username"
                  className="bg-transparent outline-none w-full border border-transparent"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 bg-gray-50 hover:border-purple-900 duration-75">
                <LockClosedIcon className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="bg-transparent outline-none w-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="text-gray-400 text-sm ml-2"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Display error if any */}
            {error && <p className="text-red-600 text-sm">{error}</p>}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-md ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            {/* Forgot Password */}
            <div className="text-center">
              <Link to={`/security/authentication-tokens/new`} className="text-sm text-purple-600 hover:underline">
                I don’t know my password
              </Link>
            </div>

            {/* Divider */}
            <div className="border-t pt-6" />

            {/* Sign in with Phone */}
            <Link
              to={`/accounts/sign-in/phone`}
              className="w-full border border-purple-600 text-purple-600 font-semibold py-2 rounded-md flex items-center justify-center gap-2 hover:bg-purple-200 duration-75"
            >
              <PhoneIcon className="h-5 w-5" />
              Sign in with phone number
            </Link>

            {/* Sign in with Google */}
            <button
              type="button"
              className="w-full border border-gray-300 text-gray-700 py-2 hover:bg-gray-300 duration-75  font-semibold rounded-md flex items-center justify-center gap-2"
            >
              <img src="https://www.google.com/favicon.ico" className="h-4 w-4 " alt="Google" />
              Sign in with Google
            </button>

            {/* Footer */}
            <p className="text-center text-sm mt-6">
              Don’t have an account?{' '}
              <Link to={`/onboarding/sign-up`} className="text-purple-600 hover:underline">
                Sign up
              </Link>
              <br />
              Still having trouble logging in?{' '}
              <a href="#" className="text-purple-600 hover:underline">
                Chat with us now
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
