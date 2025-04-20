
import './App.css';
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./CommonComponent/LandingPage";
import Login from "./CommonComponent/Login";
import SignupPage from "./CommonComponent/SignupPage";
import PatientHomePage from "./PatientCOmponent/PatientHomePage";
import AdminHomePage from "./AdminComponent/AdminHomePage";
import DoctorHomePage from "./DoctorComponent/DoctorHomePage";
import ManageDoctor from './AdminComponent/ManageDoctor';
import ManagePatient from './AdminComponent/ManagePatient';
import 'leaflet/dist/leaflet.css'; 
import DoctorRegistrationForm from './DoctorComponent/DoctorRegistrationForm';
import WaitPage from './DoctorComponent/WaitPage';
import Appointment from './DoctorComponent/Appointment';
import DoctorNavbar from './DoctorComponent/DoctorNavbar';
import DoctorProfile from './DoctorComponent/DoctorProfile';
import DoctorSignupPage from './CommonComponent/DoctorSignUp';
import AllDoctors from './PatientCOmponent/AllDoctors';
import BookAppointments from './PatientCOmponent/BookAppointments';
import PastAppointments from './PatientCOmponent/PastAppointments';
import DoctorAppointmentHistory from './DoctorComponent/DoctorAppointmentHistory';
import PatientRecords from './DoctorComponent/PatientRecords';
import PatientProfile from './PatientCOmponent/PatientProfile';
import Diabetes from './PatientCOmponent/PatientHomePageModels/Daibetes';
import Heart from './PatientCOmponent/PatientHomePageModels/Heart';
import Brain from './PatientCOmponent/PatientHomePageModels/Brain';
import Liver from './PatientCOmponent/PatientHomePageModels/Liver';
function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<LandingPage/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/signup" element={<SignupPage/>} />
          <Route path="/patienthomepage" element={<PatientHomePage/>} />
          <Route path="/doctorhomepage" element={<DoctorHomePage/>} />
          <Route path="/adminhomepage" element={<AdminHomePage/>} />
          <Route path="/managedoctor" element={<ManageDoctor/>} />
          <Route path="/managepatient" element={<ManagePatient/>} />
          <Route path="/docregister" element={<DoctorRegistrationForm/>} />
          <Route path="/waitpage" element={<WaitPage/>} />
          <Route path="/appointments" element={<Appointment/>} />
         <Route path="/doctornavbar" element={<DoctorNavbar/>} />
         <Route path="/doctorprofile" element={<DoctorProfile/>} />
         <Route path="/alldoctors" element={<AllDoctors/>} />
         <Route path="/doctorsignup" element={<DoctorSignupPage/>} />
         <Route path="/bookappointments" element={<BookAppointments/>} />
         <Route path="/pastappointments" element={<PastAppointments/>} />
         <Route path="/Dhistoryappointments" element={<DoctorAppointmentHistory/>} />
         <Route path="/patient-records/:patientEmail" element={<PatientRecords />} />
         <Route path="/patientprofile" element={<PatientProfile />} />
         <Route path="/Diabetes" element={<Diabetes />} />
         <Route path="/Heart" element={<Heart />} />
         <Route path="/Brain" element={<Brain />} />
         <Route path="/Liver" element={<Liver />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;



