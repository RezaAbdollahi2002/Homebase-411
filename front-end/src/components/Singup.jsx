import React from 'react'
import Register_image_homepage from '../images/register_homebase_images.png'
import { ChevronDoubleRightIcon, ArrowRightIcon} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { Typewriter } from 'react-simple-typewriter';

const Singup = () => {
  return (
    <div>
      
        <div className='grid grid-cols-1 min-h-screen items-center   md:grid-cols-2   '>
            {/* Left */}
            <div className=' min-h-screen flex flex-col   px-6 py-8  bg-white'>
                <h1 className='font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-purple-700 mb-4 '>homebase</h1>
                <div className='flex flex-col justify-center items-center px-6 py-10 text-center my-auto'>
                    <h1 className='text-black font-bold text-xl md:text-2xl lg:text-3xl xl:text-5xl mb-4'>Let’s Make Work Easier.</h1>
                    <p className='text-purple-700 text-lg mt-2  md:text-xl lg:text-2xl xl:text-3xl'>
                    How will you be using{' '}
                    <span className='font-bold text-black'>
                        <Typewriter
                            words={['Homebase', 'Homebase AI', 'Homebase Portal']}
                            loop
                            cursor
                            cursorStyle='_'
                            typeSpeed={120}
                            deleteSpeed={50}
                            delaySpeed={1000}
                            />
                    </span>{' '}
                    ?
                    </p>
                </div>
            </div>
            
             {/* Right Side: Sign-In Form */}
            <div className="w-full h-screen bg-amber-100 px-10 py-16 flex flex-col justify-center items-center">
                <div className=' w-full max-w-xl mx-auto'>

                    <div className='mb-4'>
                            <h1 className='text-medium md:text lg'>Already have an account? <Link to={`/accounts/sign-in`}><span className='text-purple-700 underline hover:no-underline duration-75 
                            hover:font-bold '>Sign In</span></Link></h1>
                    </div>
                
                <div className='flex flex-col gap-y-2 '>
                    <div className='bg-white shadow-2xl rounded-3xl hover:scale-105 duration-100 p-4 md:p-5 xl:p-6 max-w-[400px] max-h-350px md:max-w-[450px] md:max-h-[420px] md:mb-5 md:shadow-3xl grid gap-4 '>
                        <Link
                        to={`/onboarding/sign-up/owner-info`}
                        >
                        <div className='flex items-center justify-between'>
                            <h1 className='text-bold text-lg md:text-xl lg:text-2xl xl:text-3xl'>Do you own or manage a business?</h1>
                            <ChevronDoubleRightIcon className='h-20 w-20  justify-end items-end text-gray-400'/>
                           
                        </div>
                        <div className='flex text-purple-700'>
                             <p className='text-sm xl:text-lg'>Set up a new bussiness</p>
                             <ArrowRightIcon className='h-4 w-4 text- mt-2 ml-1'/>
                        </div>
                        </Link>
                    </div>
                     <div className='bg-white shadow-2xl  rounded-3xl hover:scale-105 duration-100 p-4 md:p-5 xl:p-6 max-w-[400px] max-h-350px grid gap-4 md:max-w-[450px] md:max-h-[420px] md:mb-5 md:shadow-3xl  '>
                        <Link
                        to={`/onboarding/sign-up/user-info`}>
                        <div className='flex items-center justify-between'>
                            <h1 className='text-bold text-lg md:text-xl lg:text-2xl xl:text-3xl'>Are you an employee joining a team?</h1>
                            <ChevronDoubleRightIcon className='h-20 w-20  justify-end items-end text-gray-400'/>
                           
                        </div>
                        <div className='flex text-purple-700'>
                             <p className='text-sm xl:text-lg'>Sign in with your phone or email</p>
                             <ArrowRightIcon className='h-4 w-4 mt-2 ml-1'/>
                        </div>
                        </Link>
                    </div>
                </div>

                </div>
                
                
            </div>
        </div>
    </div>
  )
}

export default Singup
