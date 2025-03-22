document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (username === "hradmin" && password === "hr123") {
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('hrPortalAuth', 'true');
            sessionStorage.setItem('hrUsername', username);
            window.location.href = "hr-dashboard.html";
        } else {
            alert("Invalid credentials. Please try again.");
        }
    });

    // Check authentication on page load
    if (window.location.pathname.includes('admin.html')) {
        if (sessionStorage.getItem('hrPortalAuth') === 'true') {
            window.location.href = "hr-dashboard.html";
        }
    }
});