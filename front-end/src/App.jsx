import { Routes, Route, BrowserRouter } from 'react-router-dom';
import {
  Register, AccountRecovery, SignInPhoneNumber, Singup,
  OwnerSignup, OwnerMotivation, BusinessInfoOwnerSignUp, CreateOwnerAccount,
  SignupEmployee, UserSignup, UserContactInfoSignup, UserAccountinfo,
  UserCheckingAccountInfo, EmployeeDashboard, FinalizeOwnerAccount, EmployeeSettings,
  Team, Message, EmployerDashboard, EmployerProfile,EmployerSettings,EmployeeSchedule, EmployerSchedule
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
        <Route path='/onboarding/sign-up/employer-dashborad' element={<EmployerDashboard />} />
        <Route path='/onboarding/sign-up/employer-schedule' element={<EmployerSchedule />} />

        {/* Employee Routes */}
        <Route path='/onboarding/sign-up/user-info' element={<UserSignup />} />
        <Route path='/onboarding/sign-up/user-contact' element={<UserContactInfoSignup />} />
        <Route path='/onboarding/sign-up/user-accountuser' element={<UserAccountinfo />} />
        <Route path='/onboarding/sign-up/user-account-edit-checking' element={<UserCheckingAccountInfo />} />
        <Route path='/onboarding/sign-up/employee-dashboard' element={<EmployeeDashboard />} />

        {/* Settings Layout with nested pages */}
        <Route path='/onboarding/sign-up/employee-settings' element={<EmployeeSettings />}>
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
        <Route path='/onborading/sign-up/team' element={<Team />}/>
        <Route path='/onborading/sign-up/message' element={<Message />}/>
        <Route path='/onborading/Schedule' element={<EmployeeSchedule />}/>
      </Routes>
      
    </BrowserRouter>
  );
};

export default App;
