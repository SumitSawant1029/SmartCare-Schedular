import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API_URL from "../config";
import "./PatientRecords.css";
import DoctorNavbar from "./DoctorNavbar";

const PatientRecords = () => {
  const { patientEmail } = useParams();
  const [appointmentData, setAppointmentData] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);

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

    fetchPatientRecords();
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
      <div className="records-container">
        <h2>Patient Records</h2>
        {appointmentData.length > 0 ? (
          <ul>
            {appointmentData.map((record) => (
              <li key={record.appointmentId}>
                <button
                  className="record-button"
                  onClick={() => fetchRecordDetails(record.appointmentId)}
                >
                  {`Appointment ID: ${record.appointmentId} | Date: ${new Date(
                    record.appointmentDate
                  ).toDateString()}`}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No records found for this patient.</p>
        )}
      </div>

      {selectedRecord && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Record Details</h3>
            <p>
              <strong>Notes:</strong> {selectedRecord.notes}
            </p>
            <button
              className="btn download-btn"
              onClick={() => downloadPdf(selectedRecord.prescription, "prescription.pdf")}
            >
              Download Prescription
            </button>
            <button
              className="btn download-btn"
              onClick={() => downloadPdf(selectedRecord.report, "report.pdf")}
            >
              Download Report
            </button>
            <button className="btn close-btn" onClick={() => setSelectedRecord(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PatientRecords;
