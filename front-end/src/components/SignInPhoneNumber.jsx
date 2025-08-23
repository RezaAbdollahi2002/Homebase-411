import React from 'react'
import Register_image_homepage from '../images/register_homebase_images.png'
import { EnvelopeIcon, LockClosedIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';



const SignInPhoneNumber = () => {
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
            
             {/* Right Side: Sign-In Form */}
            <div className="bg-white flex flex-col justify-center h-full w-full px-10 py-16">
                <div className="max-w-[400px] w-full mx-auto">
                    <h2 className="text-3xl font-bold mb-8 text-center">Sign in</h2>

                        <form className="space-y-6">
                       

                       <div >
                            <p>Mobile phone number</p>
                            <div className='flex w-full px-3 py-2 bg-transparent outline-none border border-gray-200 hover:border-purple-700 '>
                                <PhoneIcon className='w-5 h-5 text-purple-700 mr-3 mt-1' />
                                <input
                                type="tel"
                                className="w-full bg-transparent outline-none border border-transparent"
                                placeholder="(123) 456-7890"
                                pattern="\(\d{3}\) \d{3}-\d{4}"
                                required
                                />   
                         </div>

                        </div>

                        {/* Sign In Button */}
                        <button
                            type="submit"
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-md"
                        >
                            Sign in
                        </button>

                       

                        

                        {/* Divider */}
                        <div className="border-t pt-6" />

                        {/* Sign in email address */}
                        <Link
                            to={`/accounts/sign-in`}
                            className="w-full border border-purple-600 text-purple-600 font-semibold py-2 rounded-md flex items-center justify-center gap-2 hover:bg-purple-200 duration-75"
                            >
                            <PhoneIcon className="h-5 w-5" />
                            Sign in with email address
                        </Link>

                        {/* Sign in with Google */}
                        <button
                            type="button"
                            className="w-full border border-gray-300 text-gray-700 py-2 hover:bg-gray-300 duration-75  font-semibold rounded-md flex items-center justify-center gap-2"
                        >
                            <img src="https://www.google.com/favicon.ico" className="h-4 w-4" alt="Google" />
                            Sign in with Google
                        </button>

                        {/* Footer */}
                        <p className="text-center text-sm mt-6">
                            Don’t have an account? <a href="#" className="text-purple-600 hover:underline">Sign up</a>
                            <br />
                            Still having trouble logging in? <a href="#" className="text-purple-600 hover:underline">Chat with us now</a>
                        </p>
                        </form>
                </div>
            </div>
        </div>
    </>
  )
}

export default SignInPhoneNumber
