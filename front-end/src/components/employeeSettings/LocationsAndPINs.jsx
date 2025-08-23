import React, { useState, useEffect } from 'react'
import axios from 'axios'

const LocationsAndPINs = () => {
  const [location, setLocation] = useState('')
  const [error, setError] = useState(null)

  // Replace with the actual employee ID you want to fetch for
  const employeeId = 1

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/employees/settings/${employeeId}/location`)
      .then(response => {
        setLocation(response.data.location)
      })
      .catch(err => {
        setError('Failed to load location')
        console.error(err)
      })
  }, [employeeId])

  return (
    <div className='flex flex-col mx-2 w-full h-screen'>
      <h1 className='text-lg md:text-xl font-bold my-2'>Locations & PINs</h1>
      <div className='flex flex-col border rounded-sm border-gray-400 bg-white px-2 py-2 max-w-[400px]'>
        <div className='flex justify-between'>
          <p className='text-left'>Locations</p>
          <p className='justify-end'>Your PINs</p>
        </div>
        <hr />
        <div className='mt-2'>
          {error ? (
            <p className='text-red-500'>{error}</p>
          ) : (
            <p>{location || 'Loading location...'}</p>
          )}
          {/* You can add PINs similarly */}
          <p>{/* PINs go here */}</p>
        </div>
      </div>
    </div>
  )
}

export default LocationsAndPINs
