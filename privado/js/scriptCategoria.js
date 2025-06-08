const urlBase = 'http://localhost:3000/categorias';

const formulario = document.getElementById("formCadCategoria");
let listaDeCategorias = [];

formulario.onsubmit = manipularSubmissao;

function manipularSubmissao(evento) {
    if (formulario.checkValidity()) {
        const nome = document.getElementById("nome").value;
        const descricao = document.getElementById("descricao").value;
        const status = document.getElementById("statusCategoria").value;

        const categoria = { nome, descricao, status };

        cadastrarCategoria(categoria);
        formulario.reset();
        mostrarTabelaCategorias();
    } else {
        formulario.classList.add('was-validated');
    }

    evento.preventDefault();
    evento.stopPropagation();
}

function mostrarTabelaCategorias() {
    const divTabela = document.getElementById("tabelaC");
    divTabela.innerHTML = "";

    if (listaDeCategorias.length === 0) {
        divTabela.innerHTML = "<p class='alert alert-info text-center'>Não há categorias cadastradas</p>";
    } else {
        const tabela = document.createElement('table');
        tabela.className = "table table-striped table-hover";

        const cabecalho = document.createElement('thead');
        const corpo = document.createElement('tbody');

        cabecalho.innerHTML = `
            <tr>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Status</th>
                <th>Ações</th>
            </tr>
        `;
        tabela.appendChild(cabecalho);

        for (let i = 0; i < listaDeCategorias.length; i++) {
            const linha = document.createElement('tr');
            linha.id = listaDeCategorias[i].id;

            linha.innerHTML = `
                <td>${listaDeCategorias[i].nome}</td>
                <td>${listaDeCategorias[i].descricao}</td>
                <td>${listaDeCategorias[i].status}</td>
                <td>
                    <button type="button" class="btn btn-danger" onclick="excluirCategoria('${listaDeCategorias[i].id}')">
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

function excluirCategoria(id) {
    if (confirm("Deseja realmente excluir a categoria " + id + "?")) {
        fetch(urlBase + "/" + id, {
            method: "DELETE"
        })
        .then(res => {
            if (res.ok) return res.json();
        })
        .then(() => {
            alert("Categoria excluída com sucesso!");
            listaDeCategorias = listaDeCategorias.filter(c => c.id !== id);
            document.getElementById(id)?.remove();
        })
        .catch(erro => {
            alert("Não foi possível excluir a categoria: " + erro);
        });
    }
}

function obterDadosCategorias() {
    fetch(urlBase, {
        method: "GET"
    })
    .then(res => {
        if (res.ok) return res.json();
    })
    .then(categorias => {
        listaDeCategorias = categorias;
        mostrarTabelaCategorias();
    })
    .catch(() => {
        alert("Erro ao tentar recuperar categorias do servidor!");
    });
}

function cadastrarCategoria(categoria) {
    const duplicado = listaDeCategorias.some(c => c.nome.toLowerCase() === categoria.nome.toLowerCase());
    if (duplicado) {
        alert("Já existe uma categoria com este nome!");
        return;
    }

    fetch(urlBase, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(categoria)
    })
    .then(res => {
        if (res.ok) return res.json();
        throw new Error('Erro na resposta do servidor');
    })
    .then(dados => {
        if (dados && dados.id) {
            alert(`Categoria incluída com sucesso! ID: ${dados.id}`);
            categoria.id = dados.id;
            listaDeCategorias.push(categoria);
            mostrarTabelaCategorias();
        } else {
            throw new Error('ID não retornado pelo servidor');
        }
    })
    .catch(erro => {
        alert("Erro ao cadastrar a categoria: " + erro.message);
    });
}

// Carregar categorias ao iniciar
obterDadosCategorias();
