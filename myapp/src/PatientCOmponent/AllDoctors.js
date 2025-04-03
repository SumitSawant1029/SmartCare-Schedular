import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API_URL from "../config";
import "./AllDoctors.css";
import PatientNavbar from "./PatientNavbar";

// Full star SVG component
const FullStar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path
      fill="gold"
      d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.738 1.466 8.316L12 18.896l-7.402 3.874 1.466-8.316L.001 9.306l8.332-1.151z"
    />
  </svg>
);

// Empty star SVG component
const EmptyStar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path
      fill="lightgray"
      d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.738 1.466 8.316L12 18.896l-7.402 3.874 1.466-8.316L.001 9.306l8.332-1.151z"
    />
  </svg>
);

// Half star SVG component using a linear gradient
const HalfStar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <defs>
      <linearGradient id="halfGradient">
        <stop offset="50%" stopColor="gold" />
        <stop offset="50%" stopColor="lightgray" />
      </linearGradient>
    </defs>
    <path
      fill="url(#halfGradient)"
      d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.738 1.466 8.316L12 18.896l-7.402 3.874 1.466-8.316L.001 9.306l8.332-1.151z"
    />
  </svg>
);

// StarRating component that shows 5 stars based on the rating value
const StarRating = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<FullStar key={i} />);
    } else if (rating >= i - 0.5) {
      stars.push(<HalfStar key={i} />);
    } else {
      stars.push(<EmptyStar key={i} />);
    }
  }
  return <div className="star-rating">{stars}</div>;
};

// Helper function: Haversine formula to calculate distance (in km)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const AllDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [userLocation, setUserLocation] = useState(null);
  const doctorsPerPage = 12;
  
  // New state variables for additional filters
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [selectedReview, setSelectedReview] = useState("");

  // Get current user location using browser geolocation API
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
          // Optionally set a default location if needed
        }
      );
    }
  }, []);

  // Fetch the list of doctors and calculate distance if user location exists
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(`${API_URL}/api/doc/getallusers/doctor`);
        const data = await response.json();
        let doctorsWithDistance = data || [];

        // If user location is available, calculate distance for each doctor
        if (userLocation) {
          doctorsWithDistance = doctorsWithDistance.map((doctor) => {
            if (
              doctor?.userDetails?.location?.coordinates &&
              doctor.userDetails.location.coordinates.length >= 2
            ) {
              // GeoJSON stores coordinates as [longitude, latitude]
              const doctorLon = doctor.userDetails.location.coordinates[0];
              const doctorLat = doctor.userDetails.location.coordinates[1];
              const distance = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                doctorLat,
                doctorLon
              );
              return { ...doctor, distance };
            }
            return { ...doctor, distance: Infinity }; // If no location, assign a large distance
          });
          // Sort doctors by distance (closest first)
          doctorsWithDistance.sort((a, b) => a.distance - b.distance);
        }

        setDoctors(doctorsWithDistance);
        setFilteredDoctors(doctorsWithDistance.slice(0, doctorsPerPage));
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchDoctors();
  }, [userLocation]);

  // Handle search input (only updating search term now)
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // New handlers for additional filters
  const handleSpecializationChange = (e) => {
    setSelectedSpecialization(e.target.value);
  };

  const handleReviewChange = (e) => {
    setSelectedReview(e.target.value);
  };

  // Use useEffect to apply all filters (search, specialization, review) whenever they change
  useEffect(() => {
    let filtered = doctors.filter((doctor) => {
      const term = searchTerm.toLowerCase();
      const firstName = doctor?.userDetails?.firstname?.toLowerCase() || "";
      const lastName = doctor?.userDetails?.lastname?.toLowerCase() || "";
      const specialization = doctor?.specialization?.toLowerCase() || "";
      const experience = doctor?.yearsOfExperience?.toString() || "";
      const nameMatch = firstName.includes(term) || lastName.includes(term);
      const specializationMatch = specialization.includes(term);
      const experienceMatch = experience.includes(term);
      const searchMatch = nameMatch || specializationMatch || experienceMatch;
      
      // Check additional filters if selected
      const specializationFilter = selectedSpecialization ? doctor.specialization === selectedSpecialization : true;
      const reviewFilter = selectedReview ? (doctor.review !== undefined && doctor.review >= parseFloat(selectedReview)) : true;
      
      return searchMatch && specializationFilter && reviewFilter;
    });
    setFilteredDoctors(filtered.slice(0, doctorsPerPage));
  }, [searchTerm, selectedSpecialization, selectedReview, doctors, doctorsPerPage]);

  // Handle pagination
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
        {/* Existing Search Bar Row */}
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
        {/* New Filters Row */}
        <div className="row mb-4">
          <div className="col-md-6">
            <select className="form-control" value={selectedSpecialization} onChange={handleSpecializationChange}>
              <option value="">All Specializations</option>
              <option value="Cardiologist">Cardiologist</option>
              <option value="Dentist">Dentist</option>
              <option value="Dermatologist">Dermatologist</option>
              <option value="Neurologist">Neurologist</option>
              {/* Add more specializations as needed */}
            </select>
          </div>
          <div className="col-md-6">
            <select className="form-control" value={selectedReview} onChange={handleReviewChange}>
              <option value="">All Reviews</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
            </select>
          </div>
        </div>

        <div className="row">
          {filteredDoctors.map((doctor) => {
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
                    <h5 className="card-title">Dr. {doctorName}</h5>
                    <p className="card-text" style={{ fontSize: "0.85rem" }}>
                      <strong>Specialization:</strong> {doctor?.specialization || "N/A"}
                      <br />
                      <strong>Hospital:</strong> {doctor?.hospital || "N/A"}
                      <br />
                      <strong>Years of Experience:</strong> {doctor?.yearsOfExperience || "N/A"}
                    </p>
                    {doctor.review !== undefined && (
                      <div>
                        <StarRating rating={doctor.review} />
                      </div>
                    )}
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
