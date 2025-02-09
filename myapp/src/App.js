
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
import BookAppointments from './PatientCOmponent/BookAppointments';
import DoctorSignupPage from './CommonComponent/DoctorSignUp';

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
         <Route path="/bookappointments" element={<BookAppointments/>} />
         <Route path="/doctorsignup" element={<DoctorSignupPage/>} />



        </Routes>
      </div>
    </Router>
  );
}

export default App;



