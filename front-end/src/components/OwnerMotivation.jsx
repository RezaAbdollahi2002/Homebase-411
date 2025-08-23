import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/material_blue.css';
import { CalendarDateRangeIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useSignup } from './EmployeeSignupContext';
import { useLocation } from 'react-router-dom';

const OwnerMotivation = () => {
  const navigate = useNavigate();
  const { signupData, updateSignupData } = useSignup();
  const location = useLocation();
  const formReview = location.state?.formState || false;

  const serviceOptions = ['Scheduling', 'Time Tracking', 'Payroll'];
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedServices, setSelectedServices] = useState(
    signupData.selected_services ? signupData.selected_services.split(',') : []
  );
  const [plannedOpeningDate, setPlannedOpeningDate] = useState(
    signupData.open_date ? [new Date(signupData.open_date)] : null
  );

  const {
    handleSubmit,
    register,
    setValue,
    getValues,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      selectedServices: signupData.selectedServices || false,
      plannedOpeningDate: signupData.plannedOpeningDate || false,
    },
  });

  // On mount, sync form values with state
  useEffect(() => {
    setValue('selectedServices', selectedServices);
    setValue('plannedOpeningDate', plannedOpeningDate);
  }, [setValue, selectedServices, plannedOpeningDate]);

  // Set max date = today + 1 year
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  const flatpickrOptions = {
    maxDate: maxDate,
    dateFormat: 'Y-m-d',
    allowInput: true,
  };

  // Register fields manually since you control their state
  useEffect(() => {
    register('selectedServices', { required: true });
    register('plannedOpeningDate', { required: true });
  }, [register]);

  const toggleService = (service) => {
    const updatedServices = selectedServices.includes(service)
      ? selectedServices.filter((s) => s !== service)
      : [...selectedServices, service];

    setSelectedServices(updatedServices);
    setValue('selectedServices', updatedServices); // sync with form
  };

  const handleDateChange = (date) => {
    setPlannedOpeningDate(date);
    setValue('plannedOpeningDate', date);
  };

  // Handle Next button on step 0
  const handleNextStep = () => {
    const selected = getValues('selectedServices');
    if (!selected || selected.length === 0) {
      return;
    }

    // Save selected services immediately
    updateSignupData({
      ...signupData,
      selected_services: selected.join(','),
    });

    setQuestionIndex(1);
  };

  useEffect(() => {
    if(formReview){
      reset(
        {
            selectedServices: signupData.selectedServices || false,
            plannedOpeningDate: signupData.plannedOpeningDate || false,
        }
      )
    }
  }, [formReview, signupData, reset])

  // Form submit for step 1
  const onSubmit = () => {
    const selected = getValues('selectedServices');
    const dateArray = getValues('plannedOpeningDate');

    if (!dateArray || dateArray.length === 0) {
      alert('Please select a planned opening date.');
      return;
    }

    const dateObj = dateArray[0];
    if (dateObj > maxDate) {
      alert('Opening date cannot be more than 1 year from today.');
      return;
    }

    const isoDate = dateObj.toISOString().split('T')[0];
    updateSignupData({
      ...signupData,
      open_date: isoDate,
      selected_services: selected.join(','),
    });

    if(formReview){
      navigate("/onboarding/sign-up/business-info/finalize-create-owner-account");
    }else{
        navigate('/onboarding/sign-up/business-info');  
    }
    
  };

  return (
    <div className="grid min-h-screen">
      <header className="text-purple-800 px-6 py-8 font-bold text-lg md:text-xl lg:text-2xl xl:text-3l sm:inline hidden">
        Homebase
      </header>

      <div className="mx-auto sm:mt-2 max-w-[600px] min-w-[450px] my-auto">
        <main className="flex flex-col items-center mx-auto bg-white w-full h-full px-10 py-10 max-w-md">
          <p className="text-sm xl:text-base mb-2">Step 2 of 4</p>
          <h1 className="font-bold text-xl md:text-2xl lg:text-3xl xl:text-4xl mb-8 text-center">
            What brings you to Homebase today, Reza?
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="w-full">
            {questionIndex === 0 && (
              <>
                <p className="text-base mb-4">
                  Pick what you need now, you can always do more later.
                </p>

                <fieldset className="mb-6">
                  <legend className="font-semibold mb-3 text-lg">
                    Select Services Needed
                  </legend>
                  <div className="flex gap-4 flex-wrap">
                    {serviceOptions.map((service) => {
                      const isSelected = selectedServices.includes(service);
                      return (
                        <button
                          key={service}
                          type="button"
                          onClick={() => toggleService(service)}
                          className={`px-5 py-2 rounded-md transition max-w-[250px] text-xsm md:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 select-none transform ${
                            isSelected
                              ? 'bg-purple-700 text-white shadow-lg'
                              : 'bg-white text-purple-700 border border-purple-700 hover:bg-purple-100 hover:scale-105'
                          }`}
                          aria-pressed={isSelected}
                        >
                          {service}
                        </button>
                      );
                    })}
                  </div>
                  {selectedServices.length === 0 && (
                    <p className="text-red-600 text-sm mt-1">
                      Please select at least one service.
                    </p>
                  )}
                </fieldset>

                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={selectedServices.length === 0}
                  className={`text-xsm md:text-sm px-4 py-2 rounded-sm mt-4 ${
                    selectedServices.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-purple-700 text-white'
                  }`}
                >
                  Next
                </button>
              </>
            )}

            {questionIndex === 1 && (
              <>
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    When are you planning to open your business? (Any past date
                    allowed, but no more than 1 year from today)
                  </label>
                  <div className="flex items-center gap-2">
                    <CalendarDateRangeIcon className="text-black h-6 w-6" />
                    <Flatpickr
                      options={flatpickrOptions}
                      value={plannedOpeningDate}
                      onChange={handleDateChange}
                      placeholder="Select opening date"
                      className="border rounded px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  {!plannedOpeningDate && (
                    <p className="text-red-600 mt-1 text-sm">
                      Please select a planned opening date.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!plannedOpeningDate}
                  className={`text-xsm md:text-sm px-4 py-2 rounded-sm mt-4 ${
                    !plannedOpeningDate
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-purple-700 text-white'
                  }`}
                >
                  Confirm
                </button>
              </>
            )}
          </form>
        </main>
      </div>
    </div>
  );
};

export default OwnerMotivation;
