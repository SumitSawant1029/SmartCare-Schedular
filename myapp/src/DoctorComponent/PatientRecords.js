
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API_URL from "../config";
import "./PatientRecords.css";
import DoctorNavbar from "./DoctorNavbar";
import { FaFilePdf, FaCalendarAlt, FaNotesMedical, FaUserMd, FaDownload, FaTimes } from "react-icons/fa";

const PatientRecords = () => {
  // ... [keep all your existing state and logic exactly as is]
  const { patientEmail } = useParams();
  const [appointmentData, setAppointmentData] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [summary, setSummary] = useState(""); // State for summary

  useEffect(() => {
    const fetchPatientRecords = async () => {
      try {
        const response = await fetch(`${API_URL}/api/phis/getHistoryIds`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patientEmail }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          const sortedRecords = data.appointmentData.sort(
            (a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate)
          );
          setAppointmentData(sortedRecords);
        } else {
          console.error("Error fetching records");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    const fetchNotesSummary = async () => {
      try {
        const response = await fetch(`${API_URL}/api/phis/getNotesSummary`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patientEmail }),
        });

        if (response.ok) {
          const data = await response.json();
          const filteredSummary = data.summary.replace(/For confidential support.*/i, ""); // Remove unwanted text
          setSummary(filteredSummary.trim());
        } else {
          console.error("Error fetching notes summary");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchPatientRecords();
    fetchNotesSummary();
  }, [patientEmail]);

  const fetchRecordDetails = async (appointmentId) => {
    try {
      const response = await fetch(`${API_URL}/api/phis/getHistoryById`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId }),
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedRecord(data.history);
      } else {
        console.error("Error fetching record details");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const downloadPdf = (base64String, filename) => {
    const link = document.createElement("a");
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <DoctorNavbar />
      <div className="patient-records-container">
        <div className="records-header">
          <h1>Patient Medical Records</h1>
          <div className="patient-info-card">
            <div className="patient-avatar">
              {patientEmail.charAt(0).toUpperCase()}
            </div>
            <div className="patient-details">
              <h3>Patient: {patientEmail}</h3>
              <p>{appointmentData.length} recorded visits</p>
            </div>
          </div>
        </div>

        <div className="records-grid">
          {/* Summary Section */}
          <div className="summary-card">
            <div className="card-header">
              <FaNotesMedical className="header-icon" />
              <h3>Clinical Summary</h3>
            </div>
            <div className="card-body">
              {summary ? (
                <p className="summary-text">{summary}</p>
              ) : (
                <p className="no-data">No summary available</p>
              )}
            </div>
          </div>

          {/* Appointments List */}
          <div className="appointments-card">
            <div className="card-header">
              <FaCalendarAlt className="header-icon" />
              <h3>Visit History</h3>
            </div>
            <div className="card-body">
              {appointmentData.length > 0 ? (
                <div className="appointments-list">
                  {appointmentData.map((record) => (
                    <div 
                      key={record.appointmentId} 
                      className="appointment-item"
                      onClick={() => fetchRecordDetails(record.appointmentId)}
                    >
                      <div className="appointment-date">
                        {new Date(record.appointmentDate).toLocaleDateString()}
                      </div>
                      <div className="appointment-id">
                        Visit ID: {record.appointmentId}
                      </div>
                      <div className="view-details">View Details →</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No records found for this patient</p>
              )}
            </div>
          </div>
        </div>

        {/* Record Details Modal */}
        {selectedRecord && (
          <div className="modal-overlay">
            <div className="record-modal">
              <div className="modal-header">
                <h3>
                  <FaUserMd /> Visit Details
                </h3>
                <button 
                  className="close-modal"
                  onClick={() => setSelectedRecord(null)}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body">
                <div className="notes-section">
                  <h4><FaNotesMedical /> Doctor's Notes</h4>
                  <div className="notes-content">
                    {selectedRecord.notes || "No notes available"}
                  </div>
                </div>
                <div className="documents-section">
                  <h4>Documents</h4>
                  <div className="document-buttons">
                    <button
                      className="download-btn"
                      onClick={() => downloadPdf(selectedRecord.prescription, "prescription.pdf")}
                    >
                      <FaFilePdf /> Prescription
                    </button>
                    <button
                      className="download-btn"
                      onClick={() => downloadPdf(selectedRecord.report, "report.pdf")}
                    >
                      <FaFilePdf /> Medical Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PatientRecords;