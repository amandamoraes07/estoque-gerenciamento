const db = firebase.firestore();

function mostrarAdicionar() {
    const conteudo = document.getElementById('conteudo');
    conteudo.innerHTML = `
        <form onsubmit="adicionarItem(event)">
            <label>Nome do Item:</label>
            <input type="text" id="nome-item" required>
            
            <label>Quantidade:</label>
            <input type="number" id="quantidade-item" required min="0">
            
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

    conteudo.innerHTML = `<div id="tabelaEstoque"></div>`;
    const divTabela = document.getElementById('tabelaEstoque');
    let todosOsItens = [];

    function renderizarTabela(itensFiltrados) {
        if (todosOsItens.length === 0) {
            return;
        }

        const valorBuscaAtual = document.getElementById('busca')?.value || '';

        const inputBuscaHTML = `
            <input type="text" id="busca" placeholder="Buscar item por nome" style="margin-bottom: 10px; padding: 5px; width: 100%;">
        `;

        let tabela = "";

        if (itensFiltrados.length === 0) {
            tabela = `<p>Nenhum item encontrado.</p>`;
        } else {
            tabela += `
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

            itensFiltrados.forEach(doc => {
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
        }

        divTabela.innerHTML = inputBuscaHTML + tabela;

        const inputBusca = document.getElementById('busca');
        if (inputBusca) {
            inputBusca.value = valorBuscaAtual;
            inputBusca.focus();
            inputBusca.addEventListener("input", aplicarFiltro);
        }
    }

    function aplicarFiltro() {
        const inputBusca = document.getElementById('busca');
        const termo = inputBusca ? inputBusca.value.toLowerCase() : '';
        const filtrados = todosOsItens.filter(doc =>
            doc.data().nome.toLowerCase().includes(termo)
        );
        renderizarTabela(filtrados);
    }

    unsubscribeEstoque = db.collection("estoque")
    .where("uid", "==", firebase.auth().currentUser.uid)
    .onSnapshot((querySnapshot) => {
        todosOsItens = querySnapshot.docs;

        if (todosOsItens.length > 0) {
            renderizarTabela(todosOsItens);
        }
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

    const user = firebase.auth().currentUser;

    const novoItem = {
        nome,
        quantidade,
        uid: user.uid,
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
  mostrarModalConfirmacao("Tem certeza que deseja excluir este item?", () => {
    db.collection("estoque").doc(id).delete()
      .then(() => {
        exibirMensagem("Item excluído com sucesso!");
        mostrarEstoque();
      })
      .catch((error) => {
        console.error("Erro ao excluir item: ", error);
        exibirMensagem("Erro ao excluir item.", "erro");
      });
  });
}

function logout() {
  mostrarModalConfirmacao("Tem certeza que deseja sair?", () => {
    auth.signOut().then(() => {
      window.location.href = 'index.html';
    });
  });
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

function mostrarModalConfirmacao(mensagem, callbackSim) {
  const modal = document.getElementById('modalConfirmacao');
  const mensagemModal = document.getElementById('mensagemModal');
  const btnConfirmar = document.getElementById('btnConfirmar');
  const btnCancelar = document.getElementById('btnCancelar');

  mensagemModal.textContent = mensagem;
  modal.classList.remove('oculto');

  function limparEventos() {
    btnConfirmar.removeEventListener('click', confirmar);
    btnCancelar.removeEventListener('click', cancelar);
  }

  function confirmar() {
    limparEventos();
    modal.classList.add('oculto');
    callbackSim(); // ação que você quer executar
  }

  function cancelar() {
    limparEventos();
    modal.classList.add('oculto');
  }

  btnConfirmar.addEventListener('click', confirmar);
  btnCancelar.addEventListener('click', cancelar);
}
