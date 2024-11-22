//import
const db = require('../config/db');
const bcrypt = require('bcryptjs');

//user registration function
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validate input
        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check which table to use based on role
        let table;
        switch(role) {
            case 'doctor':
                table = 'doctors';
                break;
            case 'patient':
                table = 'patients';
                break;
            case 'admin':
                table = 'admin';
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid role specified'
                });
        }

        // Check if user exists in any table
        const [existingAdmin] = await db.execute('SELECT email FROM admin WHERE email = ?', [email]);
        const [existingDoctor] = await db.execute('SELECT email FROM doctors WHERE email = ?', [email]);
        const [existingPatient] = await db.execute('SELECT email FROM patients WHERE email = ?', [email]);

        if (existingAdmin.length > 0 || existingDoctor.length > 0 || existingPatient.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const [result] = await db.execute(
            `INSERT INTO ${table} (name, email, password) VALUES (?, ?, ?)`,
            [name, email, hashedPassword]
        );

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            userId: result.insertId
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during registration',
            error: error.message
        });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('Login attempt for:', email); // Debug log

        // Check all tables for the user
        const [admins] = await db.execute('SELECT * FROM admin WHERE email = ?', [email]);
        const [doctors] = await db.execute('SELECT * FROM doctors WHERE email = ?', [email]);
        const [patients] = await db.execute('SELECT * FROM patients WHERE email = ?', [email]);

        let user = null;
        let role = '';

        if (admins.length > 0) {
            user = admins[0];
            role = 'admin';
        } else if (doctors.length > 0) {
            user = doctors[0];
            role = 'doctor';
        } else if (patients.length > 0) {
            user = patients[0];
            role = 'patient';
        }

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid password'
            });
        }

        // Successful login
        res.status(200).json({
            success: true,
            message: 'Login successful',
            role: role,
            userId: user.id,
            name: user.name,
            email: user.email
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: error.message
        });
    }
};
