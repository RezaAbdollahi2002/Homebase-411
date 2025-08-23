import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import businesInfoImage from '../images/homebase-business-info.png';
import { useSignup } from "./EmployeeSignupContext";
import { useLocation } from "react-router-dom";

const BusinessInfoOwnerSignUp = () => {
  const navigate = useNavigate();
  const { signupData, updateSignupData } = useSignup();
  const location = useLocation();
  const formReview = location.state?.formState || false;

  const [selectedPeople, setSelectedPeople] = useState(signupData.NumberOfEmployees || "");
  const [specificRange, setSpecificRange] = useState(
    // If signupData.NumberOfEmployees is one of the specific ranges, set it here
    ["50-99", "100-199", "200+"].includes(signupData.NumberOfEmployees) ? signupData.NumberOfEmployees : ""
  );

  const listOfBusiness = [
    'Restaurant and Coffee Shop',
    'Lifeguarding'
  ];

  const listOfNumberOfPeople = [
    '1-5', '6-10', '11-19', '20-29', '30-49', '50+'
  ];

  const listOfNumberOfPeopleOver50 = [
    '50-99', '100-199', '200+'
  ];

  const locationOptions = [
    'No, we only have one location',
    "Not yet, but we're expanding locations soon",
    "Yes, we have multiple locations"
  ];

  const checkZipCode = async (zipcode) => {
    try {
      const response = await axios.get("/api/company-signup-zipcode-check", {
        params: { zipcode }
      });
      return response.data; // expects { zipcode_exists: boolean }
    } catch (err) {
      console.error("Error checking zip code", err);
      return null;
    }
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      BusinessName: signupData.BusinessName || "",
      BusinessType: signupData.BusinessType || "",
      primary_address: signupData.primary_address || "",
      MultipleLocations: signupData.MultipleLocations || "",
      NumberOfEmployees: signupData.NumberOfEmployees || "",
    },
  });


  const multipleLocationsValue = watch("MultipleLocations");

  const handleSelectPeople = (number) => {
    setSelectedPeople(number);
    setValue("NumberOfEmployees", number);

    if (number !== "50+") {
      setSpecificRange(""); // reset specific range if under 50
    }
  };

  const handleSpecificRange = (range) => {
    setSpecificRange(range);
    setValue("NumberOfEmployees", range);
  };
  useEffect(() => {
  if (multipleLocationsValue !== "Yes, we have multiple locations") {
    setValue("primary_address", "");
    clearErrors("primary_address");
  }
}, [multipleLocationsValue, setValue, clearErrors]);


  useEffect (() => {
    if(formReview){
        // If MultipleLocations is NOT "Yes, we have multiple locations", clear primary_address on reset
    const primaryAddress =
      signupData.MultipleLocations === "Yes, we have multiple locations"
        ? signupData.primary_address || ""
        : "";
      reset (
        {
          BusinessName: signupData.BusinessName || "",
          BusinessType: signupData.BusinessType || "",
          primary_address: signupData.primary_address || "",
          MultipleLocations: signupData.MultipleLocations || "",
          NumberOfEmployees: signupData.NumberOfEmployees || "",
        }
      )
    }
  }, [formReview, signupData, reset])
  const onSubmit = async (data) => {
    // existing validations
    if (!data.NumberOfEmployees) {
      alert("Please select number of employees");
      return;
    }
    if (selectedPeople === "50+" && !specificRange) {
      alert("Please specify your employee range");
      return;
    }
    if (
      multipleLocationsValue === "Yes, we have multiple locations" &&
      !data.primary_address
    ) {
      alert("Please provide the primary address");
      return;
    }

    let hasErrors = false;

    if (multipleLocationsValue === "Yes, we have multiple locations" && data.primary_address) {
      const zipCheck = await checkZipCode(data.primary_address);
      if (zipCheck?.zipcode_exists) {
        setError("primary_address", {
          type: "manual",
          message: "Zip code is already registered",
        });
        hasErrors = true;
      }
    }

    if (hasErrors) return; // Stop submit if zip code already exists

    updateSignupData(data);

    if (formReview) {
      navigate("/onboarding/sign-up/business-info/finalize-create-owner-account");
    } else {
      navigate("/onboarding/sign-up/business-info/create-owner-account");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
      {/* Left Side */}
      <div className="min-h-screen w-full bg-white px-6 py-10">
        <h1 className="sm:inline hidden text-lg md:text-2xl lg:text-2xl xl:text-3xl font-bold text-purple-800 ">Homebase</h1>

        <div className="flex flex-col justify-center items-center mx-auto max-w-[500px] mt-10">
          <p className="text-xs md:text-sm text-gray-500">STEP 3 OF 4</p>
          <h1 className="font-bold text-lg md:text-xl lg:text-2xl xl:text-3xl my-3">
            Reza, tell us about your business
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-full">
            {/* Business Name */}
            <p className="font-semibold md:text-lg text-purple-950 mt-2">
              What's your business called?
            </p>
            <input
              type="text"
              {...register("BusinessName", { required: "Business name is required" })}
              className={`px-2 py-1.5 border shadow w-full rounded-lg bg-gray-100 text-md md:text-lg ${
                errors.BusinessName ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Business Name"
            />
            {errors.BusinessName && (
              <p className="text-red-500 text-sm">{errors.BusinessName.message}</p>
            )}

            {/* Business Type */}
            <p className="font-semibold md:text-lg mt-4">What kind of business is it?</p>
            <select
              {...register("BusinessType", { required: "Business type is required" })}
              className="px-2 py-2 border border-gray-300 shadow w-full rounded-lg bg-gray-100 text-md md:text-lg my-2"
            >
              <option value="">Select a business type</option>
              {listOfBusiness.map((option, key) => (
                <option value={option} key={key}>
                  {option}
                </option>
              ))}
            </select>
            {errors.BusinessType && (
              <p className="text-red-500 text-sm">{errors.BusinessType.message}</p>
            )}

            {/* Employee Count Buttons */}
            <p className="font-semibold md:text-lg mt-4">
              How many employees are working in your business?
            </p>
            <div className="flex gap-2 flex-wrap mt-3">
              {listOfNumberOfPeople.map((number, key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelectPeople(number)}
                  className={`border rounded-lg px-3 py-1 text-md md:text-lg text-purple-950 hover:bg-purple-700 hover:text-white duration-200 ${
                    selectedPeople === number
                      ? "bg-purple-700 text-white font-bold"
                      : "bg-gray-100 border-gray-300"
                  }`}
                >
                  {number}
                </button>
              ))}
            </div>

            {/* Multiple locations radios for less than 50 employees */}
            {selectedPeople && selectedPeople !== "50+" && (
              <div className="flex flex-col mt-4">
                <p className="font-semibold md:text-lg mb-2">Do you have multiple locations?</p>
                {locationOptions.map((location, key) => (
                  <label key={key} className="flex items-center gap-2 mb-2">
                    <input
                      type="radio"
                      value={location}
                      {...register("MultipleLocations", { required: true })}
                    />
                    {location}
                  </label>
                ))}
                {errors.MultipleLocations && (
                  <p className="text-red-500 text-sm">Please select a location option</p>
                )}
              </div>
            )}

            {/* Specific range + multiple locations for 50+ employees */}
            {selectedPeople === "50+" && (
              <div className="mt-6">
                <h2 className="font-semibold md:text-lg mb-2">
                  Nice, big team! Can we get a bit more specific?
                </h2>
                <div className="flex gap-2 flex-wrap">
                  {listOfNumberOfPeopleOver50.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`px-4 py-2 rounded border ${
                        specificRange === option ? "bg-purple-900 text-white" : "bg-white text-black"
                      }`}
                      onClick={() => handleSpecificRange(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col mt-4">
                  <p className="font-semibold md:text-lg mb-2">Do you have multiple locations?</p>
                  {locationOptions.map((location, key) => (
                    <label key={key} className="flex items-center gap-2 mb-2">
                      <input
                        type="radio"
                        value={location}
                        {...register("MultipleLocations", { required: true })}
                      />
                      {location}
                    </label>
                  ))}
                  {errors.MultipleLocations && (
                    <p className="text-red-500 text-sm">Please select a location option</p>
                  )}
                </div>
              </div>
            )}

            {/* Address field shown only if multiple locations is "Yes" */}
            {multipleLocationsValue === "Yes, we have multiple locations" && (
              <>
                <p className="font-semibold md:text-lg mb-2 mt-4">Zip Code</p>
                <input
                type="text"
                placeholder="Zip code"
                {...register("primary_address", {
                  required: "Zip code is required",
                  pattern: {
                    value: /^\d{5}(-\d{4})?$/,
                    message: "Please enter a valid ZIP code (e.g., 12345 or 12345-6789)",
                  },
                  onBlur: async (e) => {
                    const zipcode = e.target.value;
                    if (zipcode) {
                      const result = await checkZipCode(zipcode);
                      if (result?.zipcode_exists) {
                        setError("primary_address", {
                          type: "manual",
                          message: "Zip code is already registered",
                        });
                      } else {
                        clearErrors("primary_address");
                      }
                    }
                  },
                  onChange: () => clearErrors("primary_address"),
                })}
                className={`px-2 py-1.5 border rounded-md bg-gray-100 ${
                  errors.primary_address ? "border-red-500" : "border-gray-300"
                }`}
              />
                {errors.primary_address && (
                  <p className="text-red-500 text-sm">{errors.primary_address.message}</p>
                )}
              </>
            )}

            {/* Hidden input to register NumberOfEmployees with react-hook-form */}
            <input
              type="hidden"
              {...register("NumberOfEmployees", { required: true })}
            />

            {/* Submit Button */}
            <button
              type="submit"
              className="border w-full mt-6 px-4 py-3 rounded-lg bg-gray-200 text-black font-semibold hover:bg-purple-700 hover:text-white duration-300"
            >
              Get Last Step
            </button>
          </form>
        </div>
      </div>

      {/* Right Side Image */}
      <div className="bg-gray-100 min-h-screen w-full  hidden lg:flex">
        <img
          src={businesInfoImage}
          alt="Business Info"
          className="min-h-[500px] max-h-[700px] md:min-w-[600px] md:max-w-[800px] mx-auto my-auto bg-transparent "
        />
      </div>
    </div>
  );
};

export default BusinessInfoOwnerSignUp;
