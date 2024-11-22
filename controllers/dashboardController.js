const db = require('../config/db');

exports.getDashboardData = async (req, res) => {
    try {
        const { role, userId } = req.query;
        console.log('Fetching dashboard data for:', { role, userId }); // Debug log

        let data = {};

        switch(role) {
            case 'admin':
                // Admin sees everything
                const [admins] = await db.execute('SELECT id, name, email FROM admin');
                const [allDoctors] = await db.execute('SELECT id, name, email, specialization FROM doctors');
                const [allPatients] = await db.execute('SELECT id, name, email FROM patients');
                const [allAppointments] = await db.execute(`
                    SELECT 
                        a.id,
                        a.appointment_date,
                        a.status,
                        p.name AS patient_name,
                        d.name AS doctor_name
                    FROM appointments a
                    LEFT JOIN patients p ON a.patient_id = p.id
                    LEFT JOIN doctors d ON a.doctor_id = d.id
                    ORDER BY a.appointment_date DESC
                `);

                data = {
                    admins,
                    doctors: allDoctors,
                    patients: allPatients,
                    appointments: allAppointments,
                    counts: {
                        admins: admins.length,
                        doctors: allDoctors.length,
                        patients: allPatients.length,
                        appointments: allAppointments.length
                    }
                };
                break;

            case 'doctor':
                // Doctor sees their appointments and patients
                const [doctorAppointments] = await db.execute(`
                    SELECT 
                        a.id,
                        a.appointment_date,
                        a.status,
                        p.name AS patient_name,
                        p.contact AS patient_contact
                    FROM appointments a
                    JOIN patients p ON a.patient_id = p.id
                    WHERE a.doctor_id = ?
                    ORDER BY a.appointment_date DESC
                `, [userId]);

                const [doctorInfo] = await db.execute('SELECT id, name, email, specialization FROM doctors WHERE id = ?', [userId]);

                data = {
                    profile: doctorInfo[0],
                    appointments: doctorAppointments,
                    counts: {
                        appointments: doctorAppointments.length
                    }
                };
                break;

            case 'patient':
                // Patient sees their appointments and available doctors
                const [patientAppointments] = await db.execute(`
                    SELECT 
                        a.id,
                        a.appointment_date,
                        a.status,
                        d.name AS doctor_name,
                        d.specialization
                    FROM appointments a
                    JOIN doctors d ON a.doctor_id = d.id
                    WHERE a.patient_id = ?
                    ORDER BY a.appointment_date DESC
                `, [userId]);

                const [availableDoctors] = await db.execute('SELECT id, name, specialization FROM doctors');
                const [patientInfo] = await db.execute('SELECT id, name, email FROM patients WHERE id = ?', [userId]);

                data = {
                    profile: patientInfo[0],
                    appointments: patientAppointments,
                    availableDoctors,
                    counts: {
                        appointments: patientAppointments.length
                    }
                };
                break;

            default:
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid role' 
                });
        }

        res.json({
            success: true,
            data
        });

    } catch (error) {
        console.error('Dashboard data error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching dashboard data',
            error: error.message 
        });
    }
}; 