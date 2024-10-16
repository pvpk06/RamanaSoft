// import './App.css';
// import { Route, Routes, BrowserRouter } from 'react-router-dom';
// import SADash from './components/SuperAdmin/Dashboard/SA_Dashboard';
// import Home from './components/Home/components/Home';
// import InternDash from './components/Intern/Intern_Dashboard';
// import HrPortal from './components/HR/HRDashboard/HrDashboard';
// import AddHr from './components/HR/JobStatus/AddHr';
// import 'react-toastify/dist/ReactToastify.css';
// import CompanyData from './components/HR/CompanyData';
// import StudentDetails from './components/HR/StudentData';
// import HrJobDesc from './components/HR/HrJobDesc';
// import PostJobs from './components/HR/HrPostJobs/HrPostJobs';
// import ProfilePage from './components/HR/HrProfile/HrProfile';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import RegistrationRequests from './components/HR/RegistrationRequests/RegistrationRequests';
// import HrViewJobs from './components/HR/HrViewJobs/HrViewJobs';
// import StudentsApplied from './components/HR/StudentsApplied';
// import StudentsPlaced from './components/HR/StudentsPlaced';
// import HrLeads from './components/HR/JobStatus/HrLeads';
// import JdReceived from './components/HR/JobStatus/JdReceived';
// import SAJobDesc from './components/SuperAdmin/SAViewJobs/SAJobDesc';
// import QuizDash from './components/HR/Quiz/Admin/quiz/quizdash';
// import CreateDash from './components/HR/Quiz/Admin/quiz/QuizCreate/CreateDash';
// import QuizAttempt from './components/Intern/quiz/QuizAttempt';
// import UserQuizAnalysis from './components/Intern/quiz/userAnalyze';
// import PreviewQuiz from './components/HR/Quiz/Admin/quiz/preview/preview';
// import QuizResults from './components/HR/Quiz/Admin/results';
// import AnalyzeQuiz from './components/SuperAdmin/Quiz/Analyze/Analyze';
// import PrivateRoute from './PrivateRoute';

// function App() {
//   return (
//     <div>
//       <BrowserRouter>
//         <Routes>
//           {/* Intern routes */}
//           <Route path="/test/:token" element={<PrivateRoute role="intern" element={<QuizAttempt />} />} />
//           <Route path="/intern_dash/*" element={<PrivateRoute role="intern" element={<InternDash />} />} />
//           <Route path='/quiz-analysis/:userId/:quizToken' element={<PrivateRoute role="intern" element={<UserQuizAnalysis />} />} />

//           {/* HR routes */}
//           <Route path='/hr-dashboard/*' element={<PrivateRoute role="HR" element={<HrPortal />} />} />
//           <Route path="/hr-dashboard/post-jobs" element={<PrivateRoute role="HR" element={<PostJobs />} />} />
//           <Route path="/hr-dashboard/registration-requests" element={<PrivateRoute role="HR" element={<RegistrationRequests />} />} />
//           <Route path="/hr-dashboard/view-jobs" element={<PrivateRoute role="HR" element={<HrViewJobs />} />} />
//           <Route path="/hr-dashboard/students-applied" element={<PrivateRoute role="HR" element={<StudentsApplied />} />} />
//           <Route path="/hr-dashboard/students/:status" element={<PrivateRoute role="HR" element={<StudentsPlaced />} />} />
//           <Route path="/hr-dashboard/hr-leads" element={<PrivateRoute role="HR" element={<HrLeads />} />} />
//           <Route path="/hr-dashboard/profile" element={<PrivateRoute role="HR" element={<ProfilePage />} />} />
//           <Route path="/hr-dashboard/jd-received" element={<PrivateRoute role="HR" element={<JdReceived />} />} />
//           <Route path="/student/:candidateID" element={<PrivateRoute role="HR" element={<StudentDetails />} />} />
//           <Route path="/companies/:companyID" element={<PrivateRoute role="HR" element={<CompanyData />} />} />
//           <Route path="/hr-dashboard/job/:jobId" element={<PrivateRoute role="HR" element={<HrJobDesc />} />} />
//           <Route path='/hr-dashboard/add-hr' element={<PrivateRoute role="HR" element={<AddHr />} />} />
//           <Route path='/hr-dashboard/quiz' element={<PrivateRoute role="HR" element={<QuizDash />} />} />
//           <Route path='/edit/create/:token' element={<PrivateRoute role="HR" element={<CreateDash defaultTab="Create" />} />} />
//           <Route path='/edit/configure/:token' element={<PrivateRoute role="HR" element={<CreateDash defaultTab="Configure" />} />} />
//           <Route path='/edit/publish/:token' element={<PrivateRoute role="HR" element={<CreateDash defaultTab="Publish" />} />} />
//           <Route path='/edit/preview/:token' element={<PrivateRoute role="HR" element={<CreateDash defaultTab="Preview" />} />} />
//           <Route path='/edit/analyze/:token' element={<PrivateRoute role="HR" element={<CreateDash defaultTab="Analyze" />} />} />

//           {/* SuperAdmin routes */}
//           <Route path='/SA_dash/*' element={<PrivateRoute role="SA" element={<SADash />} />} />
//           <Route path='/SA_dash/job/:jobId' element={<PrivateRoute role="SA" element={<SAJobDesc />} />} />
//           <Route path='SA/analyze/:token' element={<PrivateRoute role="SA" element={<AnalyzeQuiz />} />} />

//           {/* Public route */}
//           <Route path='/*' element={<Home />} />

//           {/* Quiz results and preview routes */}
//           <Route path="/quiz/preview/:token" element={<PreviewQuiz />} />
//           <Route path="/results/:quizToken/:userId" element={<QuizResults />} />
//         </Routes>
//         <ToastContainer autoClose={5000} />
//       </BrowserRouter>
//     </div>
//   );
// }

// export default App;


// import React, { useState } from 'react';
// import './App.css';
// import {  Route, Routes, Navigate, HashRouter, BrowserRouter } from 'react-router-dom';

// import SADash from './components/SuperAdmin/Dashboard/SA_Dashboard';
// import Home from './components/Home/components/Home';
// import InternDash from './components/Intern/Intern_Dashboard';
// import 'react-toastify/dist/ReactToastify.css';
// import StudentDetails from './components/HRS/Dashboard/Home/StudentData';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import SAJobDesc from './components/SuperAdmin/SAViewJobs/SAJobDesc';
// // import CreateDash from './components/HR/Quiz/Admin/quiz/QuizCreate/CreateDash';
// import CreateDash from './components/HRS/Quiz/quiz/QuizCreate/CreateDash'

// import QuizAttempt from './components/Intern/quiz/QuizAttempt';
// import UserQuizAnalysis from './components/Intern/quiz/userAnalyze';
// // import PreviewQuiz from './components/HR/Quiz/Admin/quiz/preview/preview';
// //import QuizResults from './components/HR/Quiz/Admin/results'
// import AnalyzeQuiz from './components/SuperAdmin/Quiz/Analyze/Analyze';
// import HRDash from './components/HRS/Dashboard/HR_Dash';
// import InternRegistration from './components/register/intern_Reg/intern_reg';
// import GuestRegistration from './components/register/guest_Reg/guest_reg';
// import HRRegistration from './components/register/hr_Reg/hr_register';
// import PageNotFound from './components/pageNotFound';
// import GuestDashboard from './components/Guest/Guest_Dashboard';

// // function PrivateRoute({ role, element }) {
// //   const userRole = Cookies.get('role');
// //   const verified = Cookies.get('verified');
// //   console.log("Role:", userRole, "Verified:", verified);
// //   if (verified === 'true' && userRole === role) {
// //     return element;
// //   }
// //   return( 
// //   <Navigate to="/" />);
// // }

// // function App() {
// //   return (
// //     <div className=''>
// //       <BrowserRouter>
// //         <Routes>
// //           <Route path="/test/:token" element={<PrivateRoute role="intern"  element={<QuizAttempt />} />} />
// //           <Route path='/*' element={<Home />} />
// //           <Route path='/quiz/preview/:token' element={<PreviewQuiz />} />
// //           <Route path="/results/:quizToken/:userId" element={<QuizResults />} />
// //           <Route path='/quiz-analysis/:userId/:quizToken' element={<PrivateRoute role="intern" element={<UserQuizAnalysis />} />} />

// //           <Route path='/quiz/preview/:token' element={<PrivateRoute role="HR" element={<PreviewQuiz />} />} />
// //           <Route path='/quiz/preview/:token' element={<PrivateRoute role="SA" element={<PreviewQuiz />} />} />
// //           <Route path='/intern_dash/*' element={<PrivateRoute role="intern"  element={<InternDash />} />} />
// //           <Route path='/SA_dash/*' element={<PrivateRoute role="SA" element={<SADash />} />} />
// //           <Route path='/hr-dashboard/*' element={<PrivateRoute role="HR" element={<HrPortal />} />} />

// //           <Route path="/hr-dashboard/post-jobs" element={<PrivateRoute role="HR" element={<PostJobs />} />} />
// //           <Route path="/hr-dashboard/registration-requests" element={<PrivateRoute role="HR" element={<RegistrationRequests />} />} />
// //           <Route path="/hr-dashboard/view-jobs" element={<PrivateRoute role="HR" element={<HrViewJobs />} />} />
// //           <Route path="/hr-dashboard/students-applied" element={<PrivateRoute role="HR" element={<StudentsApplied />} />} />
// //           <Route path="/hr-dashboard/students/:status" element={<PrivateRoute role="HR" element={<StudentsPlaced />} />} />
// //           <Route path="/hr-dashboard/hr-leads" element={<PrivateRoute role="HR" element={<HrLeads />} />} />
// //           <Route path='/hr-dashboard/profile' element={<PrivateRoute role="HR" element={<ProfilePage />} />} />
// //           <Route path="/hr-dashboard/jd-received" element={<PrivateRoute role="HR" element={<JdReceived />} />} />
// //           <Route path="/hr-dashboard/companies/:status" element={<PrivateRoute role="HR" element={<JobStatus />} />} />
// //           <Route path="/student/:candidateID" element={<PrivateRoute role="HR" element={<StudentDetails />} />} />
// //           <Route path="/companies/:companyID" element={<PrivateRoute role="HR" element={<CompanyData />} />} />
// //           <Route path='/hr-dashboard/job/:jobId' element={<PrivateRoute role="HR" element={<HrJobDesc />} />} />
// //           <Route path='/hr-dashboard/add-hr' element={<PrivateRoute role="HR" element={<AddHr />} />} />
// //           <Route path='/SA_dash/job/:jobId' element={<PrivateRoute role="SA" element={<SAJobDesc />} />} />
// //           <Route path='SA/analyze/:token' element={<PrivateRoute role="SA" element={<AnalyzeQuiz />} />} />

// //           <Route path="/hr-dashboard/quiz" element={<PrivateRoute role="HR" element={<QuizDash />} />} />
//           // <Route path='/edit/create/:token' element={<PrivateRoute role="HR" element={<CreateDash defaultTab="Create" />} />} />
//           // <Route path='/edit/configure/:token' element={<PrivateRoute role="HR" element={<CreateDash defaultTab="Configure" />} />} />
//           // <Route path='/edit/publish/:token' element={<PrivateRoute role="HR" element={<CreateDash defaultTab="Publish" />} />} />
//           // <Route path='/edit/preview/:token' element={<PrivateRoute role="HR" element={<CreateDash defaultTab="Preview" />} />} />
//           // <Route path='/edit/analyze/:token' element={<PrivateRoute role="HR" element={<CreateDash defaultTab="Analyze" />} />} />



// //           <Route path='/intern_dash/applied' element={<PrivateRoute role="intern"  element={<AppliedJobs />} />} />
// //           <Route path='/intern_dash/jobs' element={<PrivateRoute role="intern"  element={<JobPortal />} />} />
// //           <Route path='/intern_dash/lms' element={<PrivateRoute role="intern"  element={<Lmsdash />} />} />
// //           <Route path='/intern_dash/quiz' element={<PrivateRoute role="intern"  element={<Quiz />} />} />
// //           <Route path='/intern_dash/profile' element={<PrivateRoute role="intern"  element={<Profile />} />} />
          
// //         </Routes>
// //       </BrowserRouter>
// //       <ToastContainer autoClose={5000} />
// //     </div>
// //   );
// // }

// // export default App;





// function App() {
//   return (
//     <div className=''>
//       <ToastContainer autoClose={5000} />
//       <BrowserRouter>
//         <Routes>
//           <Route path="/test/:token" element={<QuizAttempt />} />
//           <Route path='/' element={<Home defaultTab="home" />} />
//           <Route path='/About' element={<Home defaultTab="About" />} />
//           <Route path='/Contact' element={<Home defaultTab="Contact" />} />
//           <Route path='/Jobs' element={<Home defaultTab="Jobs" />} />
//           <Route path='/privacy-policy' element={<Home defaultTab="PrivacyPolicy" />} />
//           <Route path='/security' element={<Home defaultTab="Security" />} />
//           <Route path='/accessibility' element={<Home defaultTab="accessibility" />} />
//           <Route path='/cookies' element={<Home defaultTab="Cookies" />} />
//           <Route path='*' element={<Home defaultTab="PageNotFound" />} />

//           <Route path="*" element={<PageNotFound />} />




//           <Route path='/register/intern' element={<Home defaultTab="InternReg" />} />
//           <Route path='/register/hr' element={<Home defaultTab="HrReg" />} />
//           <Route path='/register/guest' element={<Home defaultTab="GuestReg" />} />
//           <Route path='/login/intern' element={<Home defaultTab="InternLogin" />} />
//           <Route path='/login/guest' element={<Home defaultTab="GuestLogin" />} />
//           <Route path='/login/hr' element={<Home defaultTab="HRLogin" />} />
//           <Route path='/login/SA' element={<Home defaultTab="SuperAdminLogin" />} />
        
//           {/* <Route path='/quiz/preview/:token' element={<PreviewQuiz />} />
//           <Route path="/results/:quizToken/:userId" element={<QuizResults />} /> */}
//           <Route path='/quiz-analysis/:userId/:quizToken' element={<UserQuizAnalysis />} />

//           <Route path='/SA_dash/*' element={<SADash />} />
//           <Route path='/HR_dash/*' element={<HRDash />} />
//           <Route path='/intern_dash/*' element={<InternDash />} />
//           <Route path='/extern_dash/*' element={<GuestDashboard defaultTab="Applied" />} />

//           <Route path='/SA_dash/job/:jobId' element={<SAJobDesc />} />
//           <Route path='SA/analyze/:token' element={<AnalyzeQuiz />} />
// {/* 
//           <Route path='/hr_dash/edit/create/:token' element={<CreateDash defaultTab="Create"/>} />
//           <Route path='/hr_dash/edit/configure/:token' element={<CreateDash defaultTab="Configure" />} />
//           <Route path='/hr_dash/edit/publish/:token' element={<CreateDash defaultTab="Publish" />} />
//           <Route path='/hr_dash/edit/preview/:token' element={<CreateDash defaultTab="Preview" />} />
//           <Route path='/hr_dash/edit/analyze/:token' element={<CreateDash defaultTab="Analyze" />} />
//  */}


//           {/* <Route path='/hr-dashboard/*' element={<HrPortal />} />
//           <Route path="/hr-dashboard/quiz" element={<QuizDash />} />
//           <Route path="/companies/:companyID" element={<CompanyData />} />
//           <Route path='/edit/create/:token' element={<CreateDash defaultTab="Create" />} />
//           <Route path='/edit/configure/:token' element={<CreateDash defaultTab="Configure" />} />
//           <Route path='/edit/publish/:token' element={<CreateDash defaultTab="Publish" />} />
//           <Route path='/edit/preview/:token' element={<CreateDash defaultTab="Preview" />} />
//           <Route path='/edit/analyze/:token' element={<CreateDash defaultTab="Analyze" />} />
//           {/* <Route path="/hr-dashboard/post-jobs" element={<PostJobs />} />
//           <Route path="/hr-dashboard/registration-requests" element={<RegistrationRequests />} />
//           <Route path="/hr-dashboard/view-jobs" element={<HrViewJobs />} />
//           <Route path="/hr-dashboard/hr-leads" element={<HrLeads />} />
//           <Route path='/hr-dashboard/profile' element={<ProfilePage />} />
//           <Route path="/hr-dashboard/jd-received" element={<JdReceived />} />
//           <Route path="/hr-dashboard/companies/:status" element={<JobStatus />} />
//           <Route path='/hr-dashboard/add-hr' element={<AddHr />} />
//           <Route path="/hr_dash/student/:candidateID" element={<StudentDetails />} /> */}

          

//           <Route path='/intern_dash/applied' element={<InternDash defaultTab="Applied" />} />
//           <Route path='/intern_dash/jobs' element={<InternDash defaultTab="Jobs" />} />
//           <Route path='/intern_dash/lms' element={<InternDash defaultTab="LMS" />} />
//           <Route path='/intern_dash/quiz' element={<InternDash defaultTab="Quiz" />} />
//           <Route path='/intern_dash/profile' element={<InternDash defaultTab="Profile" />} />
          
//         </Routes>
//       </BrowserRouter>
//     </div>
//   );
// }

// export default App;




import React from 'react';
import './App.css';
import { Route, Routes, Navigate, BrowserRouter, HashRouter } from 'react-router-dom';
import Cookies from 'js-cookie';  // Assuming you're using cookies for authentication and role verification.

import SADash from './components/SuperAdmin/Dashboard/SA_Dashboard';
import Home from './components/Home/components/Home';
import InternDash from './components/Intern/Intern_Dashboard';
import 'react-toastify/dist/ReactToastify.css';
import { toast,ToastContainer } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import SAJobDesc from './components/SuperAdmin/SAViewJobs/SAJobDesc';
import QuizAttempt from './components/Intern/quiz/QuizAttempt';
import UserQuizAnalysis from './components/Intern/quiz/userAnalyze';
import AnalyzeQuiz from './components/SuperAdmin/Quiz/Analyze/Analyze';
import HRDash from './components/HRS/Dashboard/HR_Dash';
import GuestDashboard from './components/Guest/Guest_Dashboard';

// PrivateRoute to handle role-based route protection
function PrivateRoute({ element, role }) {
  const userRole = Cookies.get('role');
  const verified = Cookies.get('verified');
  if (verified === 'true' && userRole === role) {
    return element;
  }
  toast.warning('Session expired. Please login again.');
  return <Navigate to="/" />;
}

function App() {
  return (
    <div className=''>
      <ToastContainer autoClose={5000} />
      <BrowserRouter>
      {/* <HashRouter basepath='/RamanaSoft/'> */}
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home defaultTab="home" />} />
          <Route path="/About" element={<Home defaultTab="About" />} />
          <Route path="/Contact" element={<Home defaultTab="Contact" />} />
          <Route path="/Jobs" element={<Home defaultTab="Jobs" />} />
          <Route path="/privacy-policy" element={<Home defaultTab="PrivacyPolicy" />} />
          <Route path="/security" element={<Home defaultTab="Security" />} />
          <Route path="/accessibility" element={<Home defaultTab="accessibility" />} />
          <Route path="/cookies" element={<Home defaultTab="Cookies" />} />
          <Route path="*" element={<Home defaultTab="PageNotFound" />} />

          {/* Registration and Login */}
          <Route path="/register/intern" element={<Home defaultTab="InternReg" />} />
          <Route path="/register/hr" element={<Home defaultTab="HrReg" />} />
          <Route path="/register/guest" element={<Home defaultTab="GuestReg" />} />
          <Route path="/login/intern" element={<Home defaultTab="InternLogin" />} />
          <Route path="/login/guest" element={<Home defaultTab="GuestLogin" />} />
          <Route path="/login/hr" element={<Home defaultTab="HRLogin" />} />
          <Route path="/login/SA" element={<Home defaultTab="SuperAdminLogin" />} />

          {/* Intern Routes */}
          <Route path="/test/:token" element={<PrivateRoute role="intern" element={<QuizAttempt />} />} />
          <Route path="/quiz-analysis/:userId/:quizToken" element={<PrivateRoute role="intern" element={<UserQuizAnalysis />} />} />
          <Route path="/intern_dash/*" element={<PrivateRoute role="intern" element={<InternDash />} />} />

          {/* HR Routes */}
          <Route path="/HR_dash/*" element={<PrivateRoute role="HR" element={<HRDash />} />} />

          {/* Super Admin (SA) Routes */}
          <Route path="/SA_dash/*" element={<PrivateRoute role="SA" element={<SADash />} />} />
          <Route path="/SA_dash/job/:jobId" element={<PrivateRoute role="SA" element={<SAJobDesc />} />} />
          <Route path="SA/analyze/:token" element={<PrivateRoute role="SA" element={<AnalyzeQuiz />} />} />

          {/* Guest Routes */}
          <Route path="/extern_dash/*" element={<PrivateRoute role="Guest" element={<GuestDashboard defaultTab="Applied" />} />} />
        </Routes>
      {/* </HashRouter> */}
            </BrowserRouter>
    </div>
  );
}

export default App;
