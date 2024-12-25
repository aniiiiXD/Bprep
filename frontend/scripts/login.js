document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginMessage = document.getElementById('login-message');
    const googleLoginButton = document.querySelector('a[href*="auth/google"]');

    // Google OAuth Login Handler
    const handleGoogleLogin = async (e) => {
        e.preventDefault();
        try {
            // Redirect to Google OAuth endpoint 
            window.location.href = 'http://localhost:3003/api/OGoogle/auth/google';
        } catch (error) {
            console.error('Google login error:', error);
            loginMessage.textContent = 'An error occurred during Google login.';
            loginMessage.className = 'text-center text-sm text-red-600';
        }
    };  

    
    if (googleLoginButton) {
        googleLoginButton.addEventListener('click', handleGoogleLogin);
    }

    
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error) {
        loginMessage.textContent = 'Authentication failed. Please try again.';
        loginMessage.className = 'text-center text-sm text-red-600';
    }
});