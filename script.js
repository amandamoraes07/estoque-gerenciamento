document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('login-error');

    const userValido = 'admin';
    const senhaValida = '1234';

    if (username === userValido && password === senhaValida) {
        window.location.href = 'dashboard.html';
    } else {
        errorMsg.textContent = 'Usuario ou senha invalidos';
    }
});