let estoque = [];

function mostrarAdicionar(){
    const conteudo = document.getElementById('conteudo');
    conteudo.innerHTML = `
        <h2>Adicionar Item</h2>
        <form onsubmit="adicionarItem(event)">
            <label>Nome do Item:</label>
            <input type="text" id="nome-item" required>
            <label>Quantidade</label>
            <input type="number" id="quantidade-item" required>
            <button type="submit">Adicionar</button>
        </form>
    `;
}

function mostrarEstoque() {
    const conteudo = document.getElementById('conteudo');

    if (estoque.length === 0){
        conteudo.innerHTML = "<h2>Estoque Vazio</h2>";
        return;
    }

    let tabela = `
        <h2>Estoque Atual</h2>
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

    estoque.forEach((item, index) => {
        tabela += `
                <tr>
                    <td>${item.nome}</td>
                    <td>${item.quantidade}</td>
                    <td>
                        <button onclick="editarItem(${index})">Editar</button>
                        <button onclick="excluirItem(${index})">Excluir</button>
                    </td>
                </tr>
        `;
    });

    tabela += `
            </tbody>
        </table>
    `;

    conteudo.innerHTML = tabela;
}

function adicionarItem(event){
    event.preventDefault();

    const nome = document.getElementById('nome-item').value;
    const quantidade = parseInt(document.getElementById('quantidade-item').value);

    estoque.push({nome, quantidade});
    alert("Item adicionado com sucesso!");

    document.getElementById('nome-item').value = '';
    document.getElementById('quantidade-item').value = '';

    mostrarEstoque();
}

function editarItem(index) {
    const item = estoque[index];
    const conteudo = document.getElementById('conteudo');

    conteudo.innerHTML = `
        <h2>Editar Item</h2>
        <form onsubmit="salvarEdicao(event, ${index})">
            <label>Nome do Item:</label>
            <input type="text" id="nome-item-edit" value="${item.nome}" required>
            <label>Quantidade:</label>
            <input type="number" id="quantidade-item-edit" value="${item.quantidade}" required>
            <div class="editar-acoes">
                <button type="submit">Salvar</button>
                <button type="button" onclick="mostrarEstoque()">Cancelar</button>
            </div>
        </form>
    `;
}

function salvarEdicao(event, index) {
    event.preventDefault();

    const nome = document.getElementById('nome-item-edit').value;
    const quantidade = parseInt(document.getElementById('quantidade-item-edit').value);

    estoque[index] = { nome, quantidade };
    alert("Item atualizado com sucesso!");

    mostrarEstoque();
}

function excluirItem(index) {
    const confirma = confirm("Tem certeza que deseja excluir este item?");

    if (confirma) {
        estoque.splice(index, 1);
        alert("Item excluído com sucesso!")

        mostrarEstoque();
    }
}

function logout() {
    const confirmaLogout = confirm("Tem certeza que deseja sair?");

    if (confirmaLogout) {
        window.location.href='index.html';
    }
}