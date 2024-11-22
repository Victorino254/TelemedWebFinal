document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('frm-login');
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        // Basic validation
        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }

        try {
            console.log('Attempting login with:', { email }); // Debug log

            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            console.log('Server response:', data); // Debug log

            if (response.ok) {
                // Store user data
                localStorage.setItem('userRole', data.role);
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('userName', data.name);

                alert('Login successful!');
                window.location.href = '/dashboard';
            } else {
                alert(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Error during login. Please try again.');
        }
    });
});