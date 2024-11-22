document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('frm-register');
    
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const role = document.getElementById('role').value;

        // Basic validation
        if (!name || !email || !password || !role) {
            alert('Please fill in all fields');
            return;
        }

        try {
            console.log('Attempting registration:', { email, role }); // Debug log

            const response = await fetch('/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    role
                })
            });

            const data = await response.json();
            console.log('Server response:', data); // Debug log

            if (response.ok) {
                alert('Registration successful! Please login.');
                window.location.href = '/';
            } else {
                alert(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Error during registration. Please try again.');
        }
    });
});