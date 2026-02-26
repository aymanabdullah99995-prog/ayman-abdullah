(function() {
    const isAuthenticated = sessionStorage.getItem('is_authenticated');
    const currentPage = window.location.pathname.split('/').pop();

    if (isAuthenticated !== 'true' && currentPage !== 'login.html' && currentPage !== 'login') {
        window.location.href = '/login.html';
    }
})();
