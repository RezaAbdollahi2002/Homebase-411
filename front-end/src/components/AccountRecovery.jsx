import Register_image_homepage from '../images/register_homebase_images.png'
import { ArrowLeftIcon,EnvelopeIcon  } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const AccountRecovery = () => {
  return (
    <>
    <div className='grid grid-cols-1 min-h-screen  md:grid-cols-2 bg-gradient-to-br from-[#2B0D59] via-[#5E1FBF] to-[#D473FF] '>
            {/* Left */}
            <div className='flex flex-col justify-between px-6 py-10 '>
                <h1 className='font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-white mb-4 '>homebase</h1>
                <div className='flex justify-center items-center'>
                    <img src={Register_image_homepage} alt="register_image"  className="max-w-[90%] md:max-w-[500px] h-auto drop-shadow-xl"/>
                </div>

                <div className='mb-15'>
                    <h1 className='font-semibold text:lg md:text-xl lg:text-2xl xl:text-3xl text-white mb-3'>AI Assistants are here.</h1>
                    <p className='text-white wrap-normal leading-relaxed text-base md:text-lg'>Fast, reliable, and built to save you more time than ever. Seriously lighten your workload with new Hiring and Scheduling assistants that do the work for you.</p>
                </div>

            </div>
            
            <div className="bg-white flex flex-col justify-center h-full w-full px-10 py-16 space-y-8">
                {/* Back Link */}
                <div className="max-w-[400px] w-full mx-auto">
                    <Link
                    to="/accounts/sign-in"
                    className="flex items-center text-purple-700 underline hover:no-underline w-fit"
                    >
                    <ArrowLeftIcon className="w-4 h-4 mr-1 pt-1" />
                    Back to Sign in
                    </Link>
                </div>

                {/* Heading and Text */}
                <div className="max-w-[400px] w-full mx-auto space-y-4">
                    <h1 className="font-semibold text-lg md:text-xl xl:text-2xl">Confirm your email</h1>
                    <p className="text-sm text-gray-700">
                    Please enter your email address linked to your Homebase account. If this address is in our system, we'll send you a one-time access code to reset your password.
                    </p>
                </div>

                {/* Form */}
                <div className="max-w-[400px] w-full mx-auto">
                    <form>
                    <div className="flex flex-col space-y-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                        <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 bg-gray-50 hover:border-purple-900 duration-75">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <input
                            type="email"
                            placeholder="you@example.com"
                            className="bg-transparent outline-none w-full border border-transparent"
                        />
                        </div>
                    </div>
                    <div className="mt-4">
                        <button
                        type="submit"
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-md"
                        >
                        Confirm
                        </button>
                    </div>
                    </form>
                </div>
                </div>

        </div>
    </>
  )
}

export default AccountRecovery
