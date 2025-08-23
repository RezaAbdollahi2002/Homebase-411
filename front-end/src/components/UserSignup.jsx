import { useForm } from "react-hook-form";
import { Typewriter } from "react-simple-typewriter";
import { useNavigate } from "react-router-dom";
import { useSignup } from "./EmployeeSignupContext";
import { useLocation } from "react-router-dom";



const UserSignup = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const fromReview = location.state?.fromReview || false;
  const {signupData, updateSignupData } = useSignup();
  const { register, handleSubmit, formState: { errors } } = useForm({
  defaultValues: {
    firstName: signupData.firstName || "",
    lastName: signupData.lastName || "",
    dob: signupData.dob || "",
    employer_id: signupData.employer_id || "",
  },
});

  const onSubmit =  (data) => {
    updateSignupData(data)
    if (fromReview){
      navigate("/onboarding/sign-up/user-account-edit-checking")
    }else{
    navigate('/onboarding/sign-up/user-contact')
    
    }
  }


  return (
    <div className="min-h-screen w-full px-4 md:px-10 py-12 bg-gradient-to-br from-gray-950 via-gray-500 to-gray-300">
      <h1 className="hidden sm:inline text-lg md:text-2xl xl:text-3xl  text-white font-semibold mb-6">
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

      <div className="bg-white text-black border border-gray-400 shadow-2xl px-6 py-8 max-w-2xl mx-auto my-auto sm:my-15 rounded-sm grid">
        <p className="mx-auto my-2">STEP 1 OF 4</p>
        <h1 className="text-center font-bold text-2xl lg:text-3xl mb-6">
          Sign Up
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-x-6 gap-y-4 px-2 md:px-4"
        >
          <h2 className="text-lg font-semibold mb-3">General Information</h2>

          {/* First Name */}
          <label htmlFor="firstName" className="block mb-1 text-sm">
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            {...register("firstName", { required: true })}
            placeholder="Ahmad Reza"
            className="input border border-gray-400 rounded-lg px-2 hover:border-gray-600"
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm">First name is required</p>
          )}

          {/* Last Name */}
          <label htmlFor="lastName" className="block mt-3 mb-1 text-sm">
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            {...register("lastName", { required: true })}
            placeholder="Doe"
            className="input border border-gray-400 rounded-lg px-2 hover:border-gray-600"
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm">Last name is required</p>
          )}

          {/* Date of Birth */}
          <label htmlFor="dob" className="block mt-3 mb-1 text-sm">
            Date of Birth
          </label>
          <input
            id="dob"
            type="date"
            {...register("dob", {
              required: true,
              validate: (value) => {
                const today = new Date();
                const birthDate = new Date(value);
                const age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                const dayDiff = today.getDate() - birthDate.getDate();

                const isOldEnough =
                  age > 15 ||
                  (age === 15 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)));

                return isOldEnough || "You must be at least 15 years old to sign up";
              },
            })}
            className="input border border-gray-400 rounded-lg px-2 hover:border-gray-600"
          />
          {errors.dob && (
            <p className="text-red-500 text-sm">{errors.dob.message || "Date of birth is required"}</p>
          )}
                    
          
          {/* Employer ID */}
          <label htmlFor="employer_id" className="block mt-3 mb-1 text-sm">
            Employer ID
          </label>
          <input
            id="employer_id"
            type="text"
            {...register("employer_id", {required: true})}
            placeholder="employee ID number"
            className="input border border-gray-400 rounded-lg px-2 hover:border-gray-600"
          />
          {errors.employer_id && <p className="text-red-500 text-sm">Employer ID is required</p>}
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

export default UserSignup;
