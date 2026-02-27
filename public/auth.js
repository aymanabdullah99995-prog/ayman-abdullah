(function() {
    const isAuthenticated = sessionStorage.getItem('is_authenticated');
    const path = window.location.pathname;
    const currentPage = path.split('/').pop();

    // Handle root path and login page variations
    const isLoginPage = currentPage === 'login.html' || currentPage === 'login';
    
    if (isAuthenticated !== 'true' && !isLoginPage) {
        window.location.href = '/login.html';
    }
})();
