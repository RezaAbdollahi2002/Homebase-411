import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { useState } from 'react';
import {
  Register, AccountRecovery, SignInPhoneNumber, Singup,
  OwnerSignup, OwnerMotivation, BusinessInfoOwnerSignUp, CreateOwnerAccount,
  SignupEmployee, UserSignup, UserContactInfoSignup, UserAccountinfo,
  UserCheckingAccountInfo, EmployeeDashboard, FinalizeOwnerAccount, EmployeeSettings,
  Team, Message, EmployerDashboard, EmployerProfile,EmployerSettings,EmployeeSchedule, EmployerSchedule,
  EmployerNavbar,EmployeeAvailabilities,
  Navbar
} from './components';
import HomePage from './pages/HomePage';
import Profile from './components/employeeSettings/Profile';
import PasswordAndSecurity from './components/employeeSettings/PasswordAndSecurity';
import Notifications from './components/employeeSettings/Notifications';
import LocationsAndPINs from './components/employeeSettings/LocationsAndPINs';
import EmployerDashvoard from './components/EmployerDashboard';
import EmployerLocationsAndPINs from './components/EmployerLocationsAndPINs' 
import EmployerasswordAndSecurity from './components/EmployerasswordAndSecurity' 
import EmployerNotifications from './components/EmployerNotifications' 


const App = () => {
  const [message, setMessage] = useState(false);

  const handleMessageState = (data) => setMessage(data);
  return (
    <BrowserRouter>
      <Routes>
        {/* Other routes */}
        <Route exact path='/' element={<HomePage />} />
        <Route path='/accounts/sign-in' element={<Register />} />
        <Route path='/accounts/sign-in/phone' element={<SignInPhoneNumber />} />
        <Route path='/security/authentication-tokens/new' element={<AccountRecovery />} />
        <Route path='/onboarding/sign-up' element={<Singup />} />

        {/* Owner Routes */}
        <Route path='/onboarding/sign-up/owner-info' element={<OwnerSignup />} />
        <Route path='/onboarding/sign-up/owner-motivation' element={<OwnerMotivation />} />
        <Route path='/onboarding/sign-up/business-info' element={<BusinessInfoOwnerSignUp />} />
        <Route path='/onboarding/sign-up/business-info/create-owner-account' element={<CreateOwnerAccount />} />
        <Route path='/onboarding/sign-up/business-info/finalize-create-owner-account' element={<FinalizeOwnerAccount />} />
        <Route path='/onboarding/sign-up/employer-dashborad' element={
          <>
            <EmployerNavbar messageState={handleMessageState} />
            <EmployerDashboard message={message} />
          </>
        }
      />
        <Route path='/onboarding/sign-up/employer-schedule' element={<EmployerSchedule />} />

        {/* Employee Routes */}
        <Route path='/onboarding/sign-up/user-info' element={<UserSignup />} />
        <Route path='/onboarding/sign-up/user-contact' element={<UserContactInfoSignup />} />
        <Route path='/onboarding/sign-up/user-accountuser' element={<UserAccountinfo />} />
        <Route path='/onboarding/sign-up/user-account-edit-checking' element={<UserCheckingAccountInfo />} />
        <Route path='/onboarding/sign-up/employee-dashboard' element={
          <>
            <Navbar messageState={handleMessageState}/>
            <EmployeeDashboard message={message} setMessage={setMessage} />
            
          </>
        }
           />

        {/* Settings Layout with nested pages */}
        <Route path='/onboarding/sign-up/employee-settings' element={<EmployeeSettings  message={message} handleMessageState={handleMessageState} setMessage={setMessage}/>}>
          <Route index element={<Profile />} /> {/* default */}
          <Route path='employee-settings-profile' element={<Profile />} />
          <Route path='employee-settings-locations' element={<LocationsAndPINs />} />
          <Route path='employee-settings-notifications' element={<Notifications />} />
          <Route path='employee-settings-passwordandsecurity' element={<PasswordAndSecurity />} />
        </Route>
        <Route path='/onboarding/sign-up/employer-settings' element={<EmployerSettings />}>
          <Route index element={<EmployerProfile />} /> {/* default */}
          <Route path='employer-settings-profile' element={<EmployerProfile />} />
          <Route path='employer-settings-locations' element={<EmployerLocationsAndPINs />} />
          <Route path='employer-settings-notifications' element={<EmployerNotifications />} />
          <Route path='employer-settings-passwordandsecurity' element={<EmployerasswordAndSecurity />} />
        </Route>
        <Route path='/onboarding/sign-up/team' element={<Team message={message} handleMessageState={handleMessageState} setMessage={setMessage}/>}/>
        <Route path='/onboarding/sign-up/message' element={<Message />}/>
        <Route path='/onboarding/Schedule' element={<EmployeeSchedule message={message} handleMessageState={handleMessageState} setMessage={setMessage}/>}/>
        <Route path='/onboarding/My_Availabilities' element={<EmployeeAvailabilities message={message} handleMessageState={handleMessageState} setMessage={setMessage}/>}/>
        
      </Routes>
      
    </BrowserRouter>
  );
};

export default App;
