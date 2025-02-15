
import React, { useState, useEffect } from 'react';
import API_URL from '../config';
import './PastAppointments.css';
import PatientNavbar from './PatientNavbar';

const PastAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [appointmentToCancel, setAppointmentToCancel] = useState(null);
    const patientEmail = localStorage.getItem('email');

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await fetch(`${API_URL}/api/book/appointments/patient`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ patientEmail }),
                });

                const data = await response.json();
                if (data.appointments) {
                    // Sorting appointments by updatedAt (latest first)
                    const sortedAppointments = data.appointments.sort(
                        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
                    );
                    setAppointments(sortedAppointments);
                } else {
                    console.error('Failed to fetch appointments');
                }
            } catch (error) {
                console.error('Error fetching appointments:', error);
            }
        };

        fetchAppointments();
    }, [patientEmail]);

    const cancelAppointment = (appointmentId) => {
        setAppointmentToCancel(appointmentId);
        setShowCancelModal(true);
    };

    const confirmCancel = async () => {
        try {
            const response = await fetch(`${API_URL}/api/book/bookings/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: appointmentToCancel }),
            });

            if (response.ok) {
                setAppointments(appointments.filter((appointment) => appointment._id !== appointmentToCancel));
                setShowCancelModal(false);
            } else {
                alert('Failed to cancel appointment');
            }
        } catch (error) {
            console.error('Error canceling appointment:', error);
            alert('Error canceling appointment');
        }
    };

    const closeCancelModal = () => {
        setShowCancelModal(false);
        setAppointmentToCancel(null);
    };

    const formatDate = (dateString) => {
        const dateObj = new Date(dateString);
        return dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
    };

    const formatTime = (dateString) => {
        const dateObj = new Date(dateString);
        return dateObj.toISOString().split('T')[1].substring(0, 5); // HH:MM format
    };

    return (
        <>
            <PatientNavbar />
            <br />
            <br />
            <br />
            <br />
            <div className="appointments-container">
                <h2>Your Appointments</h2>
                <ul>
                    {appointments.length === 0 ? (
                        <li>No appointments scheduled</li>
                    ) : (
                        appointments.map((appointment) => (
                            <li key={appointment._id} className={`appointment-card ${appointment.status}`}>
                                <span className="updated-at">Updated: {formatDate(appointment.updatedAt)}</span>

                                <div className="appointment-details">
                                    <strong>Doctor: </strong> Dr. {appointment.doctorName} <br />
                                    <strong>Date:</strong> {formatDate(appointment.appointmentDate)} <br />
                                    <strong>Time:</strong> {formatTime(appointment.appointmentDate)} <br />
                                    <strong>Symptoms:</strong> {appointment.symptoms} <br />
                                    <strong>Status:</strong>
                                    {appointment.status === "PCancelled" ? (
                                        <span className="status-cancelled">Cancelled by You</span>
                                    ) : appointment.status === "DCancelled" ? (
                                        <span className="status-cancelled">Cancelled by Doctor</span>
                                    ) : appointment.status === "ACancelled" ? (
                                        <span className="status-cancelled">Cancelled by Admin</span>
                                    ) : (
                                        <span>{appointment.status}</span>
                                    )}

                                    <br />
                                    {appointment.status !== "PCancelled" && (
                                        <button className="btn btn-danger cancel-btn" onClick={() => cancelAppointment(appointment._id)}>
                                            Cancel Appointment
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))
                    )}
                </ul>


                {showCancelModal && (
                    <div className="modal">
                        <div className="modal-content">
                            <h3>Are you sure you want to cancel this appointment?</h3>
                            <div className="modal-buttons">
                                <button onClick={confirmCancel} className="btn btn-danger">
                                    Yes, Cancel Appointment
                                </button>
                                <button onClick={closeCancelModal} className="btn btn-secondary">
                                    No, Keep Appointment
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default PastAppointments;
