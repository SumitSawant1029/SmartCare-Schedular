import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API_URL from "../config"; // Adjust the path if needed
import "./AllDoctors.css";
import PatientNavbar from "./PatientNavbar";

const AllDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 12;

  // Fetching the list of doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(`${API_URL}/api/doc/getallusers/doctor`);
        const data = await response.json();
        setDoctors(data || []);
        setFilteredDoctors((data || []).slice(0, doctorsPerPage)); // Show first 12 doctors
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchDoctors();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = doctors.filter((doctor) => {
      const nameMatch =
        doctor?.userDetails?.firstname?.toLowerCase().includes(term) || false;
      const specializationMatch =
        doctor?.specialization?.toLowerCase().includes(term) || false;
      const experienceMatch =
        doctor?.yearsOfExperience?.toString().includes(term) || false;

      return nameMatch || specializationMatch || experienceMatch;
    });

    setFilteredDoctors(filtered.slice(0, doctorsPerPage));
  };

  // Pagination handling
  const handlePagination = (pageNumber) => {
    setCurrentPage(pageNumber);
    const startIndex = (pageNumber - 1) * doctorsPerPage;
    const endIndex = startIndex + doctorsPerPage;
    setFilteredDoctors(doctors.slice(startIndex, endIndex));
  };

  return (
    <>
      <PatientNavbar />
      <br />
      <br />
      <br />
      <div className="container mt-4">
        <div className="row mb-4">
          <div className="col-md-6 offset-md-3">
            <input
              type="text"
              className="form-control search-bar"
              placeholder="Search by specialization, name, or years of experience"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className="row">
          {filteredDoctors.map((doctor) => {
            // Extract doctor details safely
            const doctorEmail =
              doctor?.userDetails?.email || doctor?.email || "Not Available";
            const doctorName =
              doctor?.userDetails?.firstname && doctor?.userDetails?.lastname
                ? `${doctor.userDetails.firstname} ${doctor.userDetails.lastname}`
                : "Unknown Doctor";

            return (
              <div className="col-md-4 mb-4" key={doctor._id}>
                <div className="card fixed-card">
                  <img
                    src={
                      doctor?.profilePicture ||
                      "https://via.placeholder.com/150"
                    }
                    className="card-img-top"
                    alt="Doctor"
                  />
                  <div className="card-body">
                    <h5 className="card-title">{doctorName}</h5>
                    <p className="card-text">
                      <strong>Specialization:</strong>{" "}
                      {doctor?.specialization || "N/A"}
                      <br />
                      <strong>Hospital:</strong> {doctor?.hospital || "N/A"}
                      <br />
                      <strong>Years of Experience:</strong>{" "}
                      {doctor?.yearsOfExperience || "N/A"}
                    </p>
                    {doctorEmail !== "Not Available" ? (
                      <Link
                        to={`/bookappointments?email=${encodeURIComponent(
                          doctorEmail
                        )}&name=${encodeURIComponent(doctorName)}`}
                      >
                        <button className="btn btn-primary">
                          Book Appointment
                        </button>
                      </Link>
                    ) : (
                      <button className="btn btn-secondary" disabled>
                        Email Not Available
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="d-flex justify-content-center">
          <button
            className="btn btn-secondary mx-2"
            onClick={() => handlePagination(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <button
            className="btn btn-secondary mx-2"
            onClick={() => handlePagination(currentPage + 1)}
            disabled={currentPage * doctorsPerPage >= doctors.length}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default AllDoctors;
