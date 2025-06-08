const urlBase = 'http://localhost:3000/clientes';

const formulario = document.getElementById("formCadCliente");
let listaDeClientes = [];

formulario.onsubmit = manipularSubmissao;

function manipularSubmissao(evento) {
    if (formulario.checkValidity()) {
        const nome = document.getElementById("nome").value;
        const cpf = document.getElementById("cpf").value;
        const telefone = document.getElementById("telefone").value;
        const cidade = document.getElementById("cidade").value;
        const uf = document.getElementById("uf").value;
        const cep = document.getElementById("cep").value;

        const cliente = { nome, cpf, telefone, cidade, uf, cep };

        cadastrarCliente(cliente);
        formulario.reset();
        mostrarTabelaClientes();
    } else {
        formulario.classList.add('was-validated');
    }

    evento.preventDefault();
    evento.stopPropagation();
}

function mostrarTabelaClientes() {
    const divTabela = document.getElementById("tabelaC");
    if (!divTabela) return;

    divTabela.innerHTML = "";

    if (listaDeClientes.length === 0) {
        divTabela.innerHTML = "<p class='alert alert-info text-center'>Não há clientes cadastrados</p>";
    } else {
        const tabela = document.createElement('table');
        tabela.className = "table table-striped table-hover";

        const cabecalho = document.createElement('thead');
        const corpo = document.createElement('tbody');

        cabecalho.innerHTML = `
            <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Telefone</th>
                <th>Cidade</th>
                <th>UF</th>
                <th>CEP</th>
                <th>Ações</th>
            </tr>
        `;
        tabela.appendChild(cabecalho);

        for (let i = 0; i < listaDeClientes.length; i++) {
            const linha = document.createElement('tr');
            linha.id = listaDeClientes[i].id;

            linha.innerHTML = `
                <td>${listaDeClientes[i].nome}</td>
                <td>${listaDeClientes[i].cpf}</td>
                <td>${listaDeClientes[i].telefone}</td>
                <td>${listaDeClientes[i].cidade}</td>
                <td>${listaDeClientes[i].uf}</td>
                <td>${listaDeClientes[i].cep}</td>
                <td>
                    <button class="btn btn-danger" onclick="excluirCliente('${listaDeClientes[i].id}')">
                        <i class="bi bi-trash"></i> Excluir
                    </button>
                </td>
            `;

            corpo.appendChild(linha);
        }

        tabela.appendChild(corpo);
        divTabela.appendChild(tabela);
    }
}

function excluirCliente(id) {
    if (confirm("Deseja realmente excluir o cliente " + id + "?")) {
        fetch(urlBase + "/" + id, {
            method: "DELETE"
        })
        .then(res => {
            if (res.ok) return res.json();
        })
        .then(() => {
            alert("Cliente excluído com sucesso!");
            listaDeClientes = listaDeClientes.filter(c => c.id !== id);
            document.getElementById(id)?.remove();
        })
        .catch(erro => {
            alert("Não foi possível excluir o cliente: " + erro);
        });
    }
}

function obterDadosClientes() {
    fetch(urlBase, {
        method: "GET"
    })
    .then(res => {
        if (res.ok) return res.json();
    })
    .then(clientes => {
        listaDeClientes = clientes;
        mostrarTabelaClientes();
    })
    .catch(() => {
        alert("Erro ao tentar recuperar clientes do servidor!");
    });
}

function cadastrarCliente(cliente) {
    const duplicado = listaDeClientes.some(c => c.cpf === cliente.cpf);
    if (duplicado) {
        alert("Já existe um cliente com este CPF!");
        return;
    }

    fetch(urlBase, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(cliente)
    })
    .then(res => {
        if (res.ok) return res.json();
        throw new Error('Erro na resposta do servidor');
    })
    .then(dados => {
        if (dados && dados.id) {
            alert(`Cliente incluído com sucesso! ID: ${dados.id}`);
            cliente.id = dados.id;
            listaDeClientes.push(cliente);
            mostrarTabelaClientes();
        } else {
            throw new Error('ID não retornado pelo servidor');
        }
    })
    .catch(erro => {
        alert("Erro ao cadastrar o cliente: " + erro.message);
    });
}

// Ao carregar a página
obterDadosClientes();
