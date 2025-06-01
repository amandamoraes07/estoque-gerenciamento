document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value.trim();
    const errorMsg = document.getElementById('login-error');
    const botao = this.querySelector('button');

    errorMsg.textContent = ''; // limpa erro anterior
    botao.disabled = true;

    if (!email || !senha) {
        errorMsg.textContent = "Preencha todos os campos.";
        botao.disabled = false;
        return;
    }

    firebase.auth().signInWithEmailAndPassword(email, senha)
        .then(() => {
            window.location.href = 'dashboard.html';
        })
        .catch(error => {
            console.error("Erro de login:", error);
            errorMsg.textContent = "Email ou senha inválidos.";
            botao.disabled = false;
        });
});
