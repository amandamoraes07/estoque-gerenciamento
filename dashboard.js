const db = firebase.firestore();

function mostrarAdicionar() {
    const conteudo = document.getElementById('conteudo');
    conteudo.innerHTML = `
        <h2>Adicionar Item</h2>
        <form onsubmit="adicionarItem(event)">
            <label>Nome do Item:</label>
            <input type="text" id="nome-item" required>
            <label>Quantidade:</label>
            <input type="number" id="quantidade-item" required>
            <button type="submit">Adicionar</button>
        </form>
    `;
}

let unsubscribeEstoque = null;

function mostrarEstoque() {
    const conteudo = document.getElementById('conteudo');

    if (unsubscribeEstoque) {
        unsubscribeEstoque();
    }

    conteudo.innerHTML = `
        <input type="text" id="busca" placeholder="Buscar item por nome" style="margin-bottom: 10px; padding: 5px; width: 100%;">
        <div id="tabelaEstoque"></div>
    `;

    const inputBusca = document.getElementById('busca');
    const divTabela = document.getElementById('tabelaEstoque');
    let todosOsItens = [];

    function renderizarTabela(itens) {
        if (itens.length === 0) {
            divTabela.innerHTML = "<p>Nenhum item encontrado.</p>";
            return;
        }

        let tabela = `
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantidade</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
        `;

        itens.forEach(doc => {
            const item = doc.data();
            tabela += `
                <tr>
                    <td>${item.nome}</td>
                    <td>${item.quantidade}</td>
                    <td>
                        <button onclick="editarItem('${doc.id}', '${item.nome}', ${item.quantidade})">Editar</button>
                        <button onclick="excluirItem('${doc.id}')">Excluir</button>
                    </td>
                </tr>
            `;
        });

        tabela += `
                </tbody>
            </table>
        `;

        divTabela.innerHTML = tabela;
    }

    function aplicarFiltro() {
        const termo = inputBusca.value.toLowerCase();
        const filtrados = todosOsItens.filter(doc =>
            doc.data().nome.toLowerCase().includes(termo)
        );
        renderizarTabela(filtrados);
    }

    inputBusca.addEventListener("input", aplicarFiltro);

    unsubscribeEstoque = db.collection("estoque").onSnapshot((querySnapshot) => {
        todosOsItens = querySnapshot.docs;
        aplicarFiltro();
    }, (error) => {
        console.error("Erro ao escutar o estoque em tempo real:", error);
        divTabela.innerHTML = "<p>Erro ao carregar estoque.</p>";
    });
}

function adicionarItem(event) {
    event.preventDefault();

    const nome = document.getElementById('nome-item').value.trim();
    const quantidade = parseInt(document.getElementById('quantidade-item').value.trim());

    if (!nome || isNaN(quantidade)) {
        alert('Preencha todos os campos.');
        return;
    }

    const novoItem = {
        nome,
        quantidade,
        dataCadastro: new Date()
    };

    db.collection("estoque").add(novoItem)
        .then(() => {
            exibirMensagem("Item adicionado com sucesso!");
            mostrarEstoque();
        })
        .catch(error => {
            console.error("Erro ao adicionar item: ", error);
            exibirMensagem("Erro ao adicionar item.", "erro");
        })
}

function editarItem(id, nome, quantidade) {
    const conteudo = document.getElementById('conteudo');

    conteudo.innerHTML = `
        <h2>Editar Item</h2>
        <form onsubmit="salvarEdicao(event, '${id}')">
            <label>Nome do Item:</label>
            <input type="text" id="nome-item-edit" value="${nome}" required>
            <label>Quantidade:</label>
            <input type="number" id="quantidade-item-edit" value="${quantidade}" required>
            <div class="editar-acoes">
                <button type="submit">Salvar</button>
                <button type="button" onclick="mostrarEstoque()">Cancelar</button>
            </div>
        </form>
    `;
}

function salvarEdicao(event, id) {
    event.preventDefault();

    const nome = document.getElementById('nome-item-edit').value;
    const quantidade = parseInt(document.getElementById('quantidade-item-edit').value);

    db.collection("estoque").doc(id).update({
        nome: nome,
        quantidade: quantidade
    })
    .then(() => {
        exibirMensagem("Item atualizado com sucesso!");
        mostrarEstoque();
    })
    .catch((error) => {
        console.error("Erro ao atualizar item: ", error);
        exibirMensagem("Erro ao atualizar item.", "erro");
    });
}

function excluirItem(id) {
    const confirma = confirm("Tem certeza que deseja excluir este item?");

    if (confirma) {
        db.collection("estoque").doc(id).delete()
            .then(() => {
                exibirMensagem("Item excluído com sucesso!");
            })
            .catch((error) => {
                console.error("Erro ao excluir item: ", error);
                exibirMensagem("Erro ao excluir item.", "erro");
            });
    }
}


function logout() {
    if (confirm("Tem certeza que deseja sair?")) {
        window.location.href = 'index.html';
    }
}

window.mostrarEstoque = mostrarEstoque;
window.mostrarAdicionar = mostrarAdicionar;
window.logout = logout;

auth.onAuthStateChanged(user => {
    if (!user) {
        window.location.href = 'index.html';
    } else {
        mostrarEstoque();
    }
});

function exibirMensagem(texto, tipo = 'sucesso') {
    console.log("Entrei aqui!");
    const divMensagem = document.getElementById('mensagem');
    divMensagem.textContent = texto;

    divMensagem.classList.remove('mensagem-oculta');
    divMensagem.classList.add('mensagem-visivel');

    if (tipo === 'erro') {
        divMensagem.classList.add('mensagem-erro');
    } else {
        divMensagem.classList.remove('mensagem-erro');
    }

    setTimeout(() => {
        divMensagem.classList.remove('mensagem-visivel');
        divMensagem.classList.add('mensagem-oculta');
    }, 3000);
}
