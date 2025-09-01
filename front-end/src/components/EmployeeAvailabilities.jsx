import { useState,useEffect } from "react";
import { FaPlus } from 'react-icons/fa';
import Message from "./Message";
import Navbar from "./Navbar";



const EmployeeAvailabilities = ({ message, handleMessageState, setMessage }) => {
    const weekdays =["Sunday", "Monday", "Tuesday", "Wednsday", "Thursday", "Friday", "Sayurday"];
  return (
    <div className="relative ">
        <Navbar messageState={handleMessageState}/>
        <div>
                <div className="flex justify-between mt-4 px-8 py-10">
                    <div>
                        <select className="border border-gray-400 rounded-sm px-2 py-1 text-xs md:text-sm lg:text-medium">
                            <option value="option 1">
                                Option 1
                            </option>
                            <option value="option 2">
                                Option 2
                            </option>
                        </select>
                    </div>
                    <div>
                         <ul className="flex  gap-6 ">
                            <li>
                                <button className="px-2 py-1 text-sm md:text-medium font-semibold border border-gray-400 rounded-sm shadow-sm bg-white hover:scale-105 duration:300 cursor-pointer">New</button>
                            </li>
                            <li>
                                <button className="px-2 py-1 text-sm md:text-medium font-semibold border border-gray-400 rounded-sm shadow-sm bg-white hover:scale-105 duration:300 cursor-pointer">Clear</button>
                            </li>
                            <li>
                                <button className="px-2 py-1 text-sm md:text-medium font-semibold border border-gray-400 rounded-sm shadow-sm bg-purple-700 text-white hover:scale-105 duration:300 cursor-pointer">Notify Manager</button>
                            </li>
                        </ul> 
                    </div>

                </div>
                        {/* SHow the avilabilities  */}
                        <div className="flex border px-4 py-4 border-sm border-gray-500 mx-8 bg-white " >
                            <div>

                            </div>
                            <div className="grid grid-cols-2">
                                <div>
                                    {
                                        weekdays.map((day,index) => {
                                            (
                                                <>
                                                    <div className="border px-2 py-1 flex ">
                                                        <span key={index}>day</span>
                                                        <button>
                                                            <FaPlus className="w-6 h-6 text-purple-800"/>
                                                        </button>
                                                    </div>
                                                </>
                                            )
                                        }) 
                                    }
                                </div>
                            </div>
                        </div>
                <div>

                </div>
                <div className={`absolute top-10 h-screen right-0 min-w-[350px] bg-white shadow-xl z-50 p-4 overflow-auto transform transition-transform duration-1000 ease-in-out ${
                        message ? "translate-x-0" : "translate-x-full"
                    }`}>
                        <Message onClose={() => setMessage(false)} />
                </div>
        </div>
      
    </div>
  );
}

export default EmployeeAvailabilities;
