const urlBase = 'http://localhost:3000/entregadores';

const formulario = document.getElementById("formCadEntregador");
let listaDeEntregadores = [];

if (localStorage.getItem("entregadores")) {
    listaDeEntregadores = JSON.parse(localStorage.getItem("entregadores"));
}
console.log(listaDeEntregadores);
formulario.onsubmit = manipularSubmissao;

function manipularSubmissao(evento) {
    if (formulario.checkValidity()) {
        const nome = document.getElementById("nome").value;
        const cpf = document.getElementById("cpf").value;
        const telefone = document.getElementById("telefone").value;
        const email = document.getElementById("email").value;
        const meioTransporte = document.getElementById("meioTransporte").value;
        const placaVeiculo = document.getElementById("placaVeiculo").value;

        const entregador = { nome, cpf, telefone, email, meioTransporte, placaVeiculo };

        cadastrarEntregador(entregador);
        formulario.reset();
        mostrarTabelaEntregadores();
    } else {
        formulario.classList.add('was-validated');
    }

    evento.preventDefault();
    evento.stopPropagation();
}

function mostrarTabelaEntregadores() {
    const divTabela = document.getElementById("tabelaEntregador");
    divTabela.innerHTML = "";

    if (listaDeEntregadores.length === 0) {
        divTabela.innerHTML = "<p class='alert alert-info text-center'>Não há entregadores cadastrados</p>";
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
                <th>Email</th>
                <th>Meio de Transporte</th>
                <th>Placa do Veículo</th>
                <th>Ações</th>
            </tr>
        `;
        tabela.appendChild(cabecalho);

        for (let i = 0; i < listaDeEntregadores.length; i++) {
            const linha = document.createElement('tr');
            linha.id = listaDeEntregadores[i].id;
            linha.innerHTML = `
                <td>${listaDeEntregadores[i].nome}</td>
                <td>${listaDeEntregadores[i].cpf}</td>
                <td>${listaDeEntregadores[i].telefone}</td>
                <td>${listaDeEntregadores[i].email}</td>
                <td>${listaDeEntregadores[i].meioTransporte}</td>
                <td>${listaDeEntregadores[i].placaVeiculo}</td>
                <td><button type="button" class="btn btn-danger" onclick="excluirEntregador('${listaDeEntregadores[i].id}')"><i class="bi bi-trash"></i> Excluir</button></td>
            `;
            corpo.appendChild(linha);
        }

        tabela.appendChild(corpo);
        divTabela.appendChild(tabela);
    }
}

function excluirEntregador(id) {
    if (confirm("Deseja realmente excluir o entregador " + id + "?")) {
        fetch(urlBase + "/" + id, {
            method: "DELETE"
        })
        .then((resposta) => {
            if (resposta.ok) return resposta.json();
        })
        .then((dados) => {
            alert("Entregador excluído com sucesso!");
            listaDeEntregadores = listaDeEntregadores.filter((e) => e.id !== id);
            document.getElementById(id)?.remove();
        })
        .catch((erro) => {
            alert("Não foi possível excluir o entregador: " + erro);
        });
    }
}

function obterDadosEntregadores() {
    fetch(urlBase, {
        method: "GET"
    })
    .then((resposta) => {
        if (resposta.ok) return resposta.json();
    })
    .then((entregadores) => {
        listaDeEntregadores = entregadores;
        mostrarTabelaEntregadores();
    })
    .catch((erro) => {
        alert("Erro ao tentar recuperar entregadores do servidor!");
    });
}

function cadastrarEntregador(entregador) {
    const duplicado = listaDeEntregadores.some(e => e.cpf === entregador.cpf);
    if (duplicado) {
        alert("Já existe um entregador com este CPF!");
        return;
    }

    fetch(urlBase, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(entregador)
    })
    .then((resposta) => {
        if (resposta.ok) return resposta.json();
        throw new Error('Erro na resposta do servidor');
    })
    .then((dados) => {
        if (dados && dados.id) {
            alert(`Entregador incluído com sucesso! ID: ${dados.id}`);
            entregador.id = dados.id;
            listaDeEntregadores.push(entregador);
            mostrarTabelaEntregadores();
        } else {
            throw new Error('ID não retornado pelo servidor');
        }
    })
    .catch((erro) => {
        alert("Erro ao cadastrar o entregador: " + erro.message);
    });
}

obterDadosEntregadores();
