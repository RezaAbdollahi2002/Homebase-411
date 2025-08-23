import ImageSignupOwner from '../images/owner-singup-image.png'
import ImageSignupOwner2 from '../images/owner-singup-image-2.png'
import OwnerSignupForm from './OwnerSignupForm';



const OwnerSignup = () => {

  return (
    <>
        <div className='grid grid-cols-1 min-h-screen  md:grid-cols-2 bg-white '>
            {/* Left */}
            <div className='md:flex md:flex-col justify-between px-6 py-10 min-h-screen'>
                {/* Top Navbar */}
                <div className='flex justify-between items-center mb-8'>
                    <h1 className='hidden md:inline text-purple-700 text-lg md:text-xl lg:text-2xl xl:text-4xl font-bold'>homebase</h1>

                </div>
                <div className='flex flex-col gap-y-4 justify-center max-w-[600px] items-center   md:my-auto md:mx-auto'>
                    <p>STEP 1 OF 4</p>
                    <h1 className='text-lg md:text-2xl lg:text-3xl xl:text-4xl font-bold '>Welcome to Homebase!</h1>
                    <p className='text-gray-700'><span className='text-gray-900'>Join thousands of businesses near you</span> already running on Homebase. No credit card required, 14-day free trial. <span className='text-xs md:text-sm text-right ml-2 py-4'>
                    Have an account?{' '}
                    <span className='text-purple-700 underline hover:no-underline hover:scale-102 duration-75'>
                        Sign in
                    </span>
                    </span></p> 
                    
                    
                
                    <OwnerSignupForm />
                </div>
            </div>
            
             {/* Right Side: Sign-In Form */}
            <div className="bg-gray-100 flex flex-col justify-center h-full w-full px-10 py-16">
                <div className="max-w-[400px] w-full mx-auto">
                    <div>
                    <p className='text-medium md:text-lg lg:text-xl xl:text-2xl font-semibold'>Simplify scheduling, time clocks, and payroll for your team with Homebase.</p>
                    </div>
                   <img src={ImageSignupOwner} alt="imageSignupOwnerImage" className='mb-2 ' />
                   <img src={ImageSignupOwner2} alt="imageSignupOwnerImage-2" className='mt-2'/>
                </div>
            </div>
        </div>
    </>
  )
}

export default OwnerSignup
