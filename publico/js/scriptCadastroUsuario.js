const urlBase = 'http://localhost:3000/usuarios';

const formulario = document.getElementById("formCadUsuario");
let listaDeUsuarios = [];

formulario.onsubmit = manipularSubmissao;

function manipularSubmissao(evento) {
    evento.preventDefault(); 
    evento.stopPropagation(); 

    if (formulario.checkValidity()) {
        const usuario = document.getElementById("usuario").value;
        const email = document.getElementById("email").value;
        const senha = document.getElementById("senha").value;

        const novoUsuario = { usuario, email, senha };

        cadastrarUsuario(novoUsuario);
        formulario.reset();
        mostrarTabelaUsuarios();
    } else {
        formulario.classList.add('was-validated');
    }
}

function mostrarTabelaUsuarios() {
    const divTabela = document.getElementById("mensagem");
    divTabela.innerHTML = "";

    if (listaDeUsuarios.length === 0) {
        divTabela.innerHTML = "<p class='alert alert-info text-center'>Nenhum usuário cadastrado</p>";
        return;
    }

    const tabela = document.createElement('table');
    tabela.className = "table table-striped table-hover";

    const cabecalho = document.createElement('thead');
    cabecalho.innerHTML = `
        <tr>
            <th>Usuário</th>
            <th>Email</th>
            <th>Ações</th>
        </tr>
    `;

    const corpo = document.createElement('tbody');

    listaDeUsuarios.forEach(usuario => {
        const linha = document.createElement('tr');
        linha.id = usuario.id;
        linha.innerHTML = `
            <td>${usuario.usuario}</td>
            <td>${usuario.email || ''}</td>
            <td>
                <button type="button" class="btn btn-danger" onclick="excluirUsuario('${usuario.id}')">
                    <i class="bi bi-trash"></i> Excluir
                </button>
            </td>
        `;
        corpo.appendChild(linha);
    });

    tabela.appendChild(cabecalho);
    tabela.appendChild(corpo);
    divTabela.appendChild(tabela);
}

function excluirUsuario(id) {
    if (confirm("Deseja realmente excluir este usuário?")) {
        fetch(`${urlBase}/${id}`, {
            method: "DELETE"
        })
        .then(res => {
            if (res.ok) return res.json();
            throw new Error("Erro ao excluir.");
        })
        .then(() => {
            listaDeUsuarios = listaDeUsuarios.filter(u => u.id !== id);
            document.getElementById(id)?.remove();
            alert("Usuário excluído com sucesso!");
        })
        .catch(erro => {
            alert("Erro ao excluir o usuário: " + erro.message);
        });
    }
}

function obterUsuarios() {
    fetch(urlBase, {
        method: "GET",
        credentials: "include"
    })
    .then(res => {
        if (res.ok) return res.text(); 
        throw new Error("Erro ao recuperar dados");
    })
        .then(texto => {
        console.log("Resposta recebida do servidor:", texto);
        try {
            const usuarios = JSON.parse(texto);
            listaDeUsuarios = usuarios;
            mostrarTabelaUsuarios(); 
        } catch (erro) {
            console.error("Resposta recebida não é JSON válido:", texto);
            alert("Erro: a resposta recebida não é JSON.");
        }
    })
    .catch((erro) => {
        alert("Erro ao tentar recuperar usuários: " + erro.message);
    });
}


function cadastrarUsuario(usuario) {
    const duplicado = listaDeUsuarios.some(u => u.usuario === usuario.usuario);
    if (duplicado) {
        alert("Já existe um usuário com este nome!");
        return;
    }

    fetch(urlBase, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(usuario)
    })
    .then(res => {
        if (res.ok) return res.json();
        throw new Error("Erro ao cadastrar.");
    })
    .then(dados => {
        listaDeUsuarios.push(usuario);
        alert("Usuário cadastrado com sucesso!");
        mostrarTabelaUsuarios();
    })
    .catch(erro => {
        alert("Erro ao cadastrar o usuário: " + erro.message);
    });
}

obterUsuarios();
