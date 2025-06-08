
const urlBase = 'http://localhost:3000/fornecedores';

const formulario = document.getElementById("formCadFornecedor");
let listaDeFornecedores = [];

if (localStorage.getItem("fornecedores")){
    listaDeFornecedores = JSON.parse(localStorage.getItem("fornecedores"));
}
console.log (listaDeFornecedores);
formulario.onsubmit = manipularSubmissao;

function manipularSubmissao(evento){
    if (formulario.checkValidity()){
        const nomeFornecedor = document.getElementById("nomeFornecedor").value;
        const cnpj = document.getElementById("cnpj").value;
        const endereco = document.getElementById("endereco").value;
        const telefone = document.getElementById("telefone").value;
        const email = document.getElementById("email").value;
        const fornecedor = {nomeFornecedor, cnpj, endereco, telefone, email};
        
        cadastrarFornecedor(fornecedor);
        formulario.reset();
        mostrarTabelaFornecedores();
    }
    else{
        formulario.classList.add('was-validated');
    }
    evento.preventDefault(); 
    evento.stopPropagation(); 

}

function mostrarTabelaFornecedores(){
    const divTabela = document.getElementById("tabelaF");
    divTabela.innerHTML=""; 
    if (listaDeFornecedores.length === 0){
        divTabela.innerHTML="<p class='alert alert-info text-center'>Não há fornecedores cadastrados</p>";
    }
    else{
        const tabelaF = document.createElement('table');
        tabelaF.className="table table-striped table-hover";

        const cabecalho = document.createElement('thead');
        const corpo = document.createElement('tbody');
        cabecalho.innerHTML=`
            <tr>
                <th>Nome Fornecedor</th>
                <th>CNPJ</th>
                <th>Endereço</th>
                <th>Telefone</th>
                <th>Email</th>
                <th>Ações</th>
            </tr>
        `;
        tabelaF.appendChild(cabecalho);
        for (let i=0; i < listaDeFornecedores.length; i++){
            const linha = document.createElement('tr');
            linha.id = listaDeFornecedores[i].id;
            linha.innerHTML=`
                <td>${listaDeFornecedores[i].nomeFornecedor}</td>
                <td>${listaDeFornecedores[i].cnpj}</td>
                <td>${listaDeFornecedores[i].endereco}</td>
                <td>${listaDeFornecedores[i].telefone}</td>
                <td>${listaDeFornecedores[i].email}</td>
                <td><button type="button" class="btn btn-danger" onclick="excluirFornecedores('${listaDeFornecedores[i].id}')"><i class="bi bi-trash"></i>Excluir</button></td>
            `;
            corpo.appendChild(linha);
        }
        tabelaF.appendChild(corpo);
        divTabela.appendChild(tabelaF);

    }
}

function excluirFornecedores(id){
    if(confirm("Deseja realmente excluir o fornecedor " + id + "?")){
        fetch(urlBase + "/" + id,{
            method:"DELETE"
        }).then((resposta) => {
            if (resposta.ok){
                return resposta.json();
            }
        }).then((dados)=>{
            alert("Cliente excluído com sucesso!");
            listaDeFornecedores = listaDeFornecedores.filter((fornecedor) => { 
                return fornecedor.id !== id;
            });
            
            document.getElementById(id)?.remove(); 
        }).catch((erro) => {
            alert("Não foi possível excluir o fornecedor: " + erro);
        });
    }
}

function obterDadosFornecedores(){
    
    fetch(urlBase, {
        method:"GET"
    })
    .then((resposta)=>{
        if (resposta.ok){
            return resposta.json();
        }
    })
    .then((fornecedores)=>{
        listaDeFornecedores=fornecedores;
        mostrarTabelaFornecedores();
    })
    .catch((erro)=>{
        alert("Erro ao tentar recuperar fornecedores do servidor!");
    });
}

function cadastrarFornecedor(fornecedor) {
    const duplicado = listaDeFornecedores.some(f => f.cnpj === fornecedor.cnpj);
    if (duplicado) {
        alert("Já existe um fornecedor com este CNPJ!");
        return;
    }
    fetch(urlBase, {
        "method": "POST",
        "headers": {
            "Content-Type": "application/json",
        },
        "body": JSON.stringify(fornecedor)
    })
    .then((resposta) => {
        if (resposta.ok) {
            return resposta.json();
        }
        throw new Error('Erro na resposta do servidor');
    })
    .then((dados) => {
        if (dados && dados.id) {
            alert(`Fornecedor incluído com sucesso! ID:${dados.id}`);
            
            fornecedor.id = dados.id;
            listaDeFornecedores.push(fornecedor);
            mostrarTabelaFornecedores();
        } else {
            throw new Error('ID não retornado pelo servidor');
        }
    })
    .catch((erro) => {
        alert("Erro ao cadastrar o fornecedor: " + erro.message);
    });
}

obterDadosFornecedores();