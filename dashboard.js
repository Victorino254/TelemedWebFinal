document.addEventListener('DOMContentLoaded', async () => {
    // Get user info from localStorage
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');

    console.log('User info:', { userRole, userId, userName }); // Debug log

    if (!userRole || !userId) {
        window.location.href = '/';
        return;
    }

    // Update welcome message
    document.getElementById('welcome-message').textContent = `Welcome, ${userName}!`;

    // Show appropriate view
    document.querySelectorAll('.role-view').forEach(view => view.style.display = 'none');
    document.getElementById(`${userRole}-view`).style.display = 'block';

    try {
        const response = await fetch(`/dashboard/data?role=${userRole}&userId=${userId}`);
        const { data } = await response.json();

        console.log('Dashboard data:', data); // Debug log

        // Update view based on role
        switch(userRole) {
            case 'admin':
                updateAdminView(data);
                break;
            case 'doctor':
                updateDoctorView(data);
                break;
            case 'patient':
                updatePatientView(data);
                break;
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        alert('Error loading dashboard data');
    }
});

function updateAdminView(data) {
    if (data.counts) {
        document.getElementById('total-doctors').textContent = data.counts.doctors || 0;
        document.getElementById('total-patients').textContent = data.counts.patients || 0;
        document.getElementById('total-appointments').textContent = data.counts.appointments || 0;
    }

    const tbody = document.querySelector('#admin-table tbody');
    if (tbody && data.appointments) {
        tbody.innerHTML = data.appointments.map(apt => `
            <tr>
                <td>${new Date(apt.appointment_date).toLocaleString()}</td>
                <td>${apt.patient_name}</td>
                <td>${apt.doctor_name}</td>
                <td>${apt.status}</td>
            </tr>
        `).join('');
    }
}

function updateDoctorView(data) {
    document.getElementById('doctor-appointments').textContent = data.counts?.appointments || 0;

    const tbody = document.querySelector('#doctor-table tbody');
    if (tbody && data.appointments) {
        tbody.innerHTML = data.appointments.map(apt => `
            <tr>
                <td>${new Date(apt.appointment_date).toLocaleString()}</td>
                <td>${apt.patient_name}</td>
                <td>${apt.status}</td>
            </tr>
        `).join('');
    }
}

function updatePatientView(data) {
    document.getElementById('patient-appointments').textContent = data.counts?.appointments || 0;

    // Update doctor select
    const doctorSelect = document.getElementById('doctor-select');
    if (doctorSelect && data.availableDoctors) {
        doctorSelect.innerHTML = `
            <option value="">Select Doctor</option>
            ${data.availableDoctors.map(doc => `
                <option value="${doc.id}">${doc.name} - ${doc.specialization}</option>
            `).join('')}
        `;
    }

    const tbody = document.querySelector('#patient-table tbody');
    if (tbody && data.appointments) {
        tbody.innerHTML = data.appointments.map(apt => `
            <tr>
                <td>${new Date(apt.appointment_date).toLocaleString()}</td>
                <td>${apt.doctor_name}</td>
                <td>${apt.status}</td>
            </tr>
        `).join('');
    }
}

// Handle appointment booking
const bookingForm = document.getElementById('booking-form');
if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const doctorId = document.getElementById('doctor-select').value;
        const appointmentDate = document.getElementById('appointment-date').value;
        const patientId = localStorage.getItem('userId');

        try {
            const response = await fetch('/dashboard/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    doctor_id: doctorId,
                    patient_id: patientId,
                    appointment_date: appointmentDate
                })
            });

            const data = await response.json();
            if (response.ok) {
                alert('Appointment booked successfully!');
                window.location.reload();
            } else {
                alert(data.message || 'Error booking appointment');
            }
        } catch (error) {
            console.error('Error booking appointment:', error);
            alert('Error booking appointment');
        }
    });
}

function logout() {
    localStorage.clear();
    window.location.href = '/';
}