
const urlBase = 'http://localhost:3000/produtos';

const formulario = document.getElementById("formCadProduto");
let listaDeProdutos = [];

if (localStorage.getItem("produtos")){
    
    listaDeProdutos = JSON.parse(localStorage.getItem("produtos"));
}
console.log(listaDeProdutos);
formulario.onsubmit=manipularSubmissao;

function calcularImposto(valor) {
return valor * 0.88;
}
function manipularSubmissao(evento){
    if (formulario.checkValidity()){
        const codigo = parseInt(document.getElementById("codigo").value);
        const nome = document.getElementById("nome").value;
        const valor = parseInt(document.getElementById("valor").value);
        const resultado = calcularImposto(valor);
        const produto = {codigo, nome, valor, resultado};
        
        cadastrarProduto(produto);
        formulario.reset();
        mostrarTabelaProdutos();
    }
    else{
        formulario.classList.add('was-validated');
    }
    evento.preventDefault(); 
    evento.stopPropagation(); 

}

function mostrarTabelaProdutos(){
    const divTabela = document.getElementById("tabelaP");
    const resultado = document.getElementById("resultado");
    
    divTabela.innerHTML = ""; 
    resultado.innerHTML = ""; 
    
    if (listaDeProdutos.length === 0){
        divTabela.innerHTML = "<p class='alert alert-info text-center'>Não há produtos cadastrados</p>";
    } else {
        const tabelaP = document.createElement('table');
        tabelaP.className = "table table-striped table-hover";

        const cabecalho = document.createElement('thead');
        const corpo = document.createElement('tbody');

        cabecalho.innerHTML = `
            <tr>
                <th>Código</th>
                <th>Nome</th>
                <th>Valor</th>
                <th>Imposto (12%)</th>
                <th>Ações</th>
            </tr>
        `;

        let total = 0; 

        for (let i = 0; i < listaDeProdutos.length; i++) {
            const linha = document.createElement('tr');
            linha.id = listaDeProdutos[i].id;
            total += listaDeProdutos[i].resultado;

            linha.innerHTML = `
                <td>${listaDeProdutos[i].codigo}</td>
                <td>${listaDeProdutos[i].nome}</td>
                <td>${listaDeProdutos[i].valor}</td>
                <td>${listaDeProdutos[i].resultado}</td>
                <td>
                    <button type="button" class="btn btn-danger" onclick="excluirProduto('${listaDeProdutos[i].id}')">
                        <i class="bi bi-trash"></i> Excluir
                    </button>
                </td>
            `;
            corpo.appendChild(linha);
        }

        tabelaP.appendChild(cabecalho);
        tabelaP.appendChild(corpo);
        divTabela.appendChild(tabelaP);

        const pTotal = document.createElement("p");
        pTotal.className = "alert alert-info text-cente";
        pTotal.textContent = `Soma total dos resultados: R$ ${total}`;
        resultado.appendChild(pTotal);
    }
}

function excluirProduto(id){
    if(confirm("Deseja realmente excluir o produto " + id + "?")){
        fetch(urlBase + "/" + id,{
            method:"DELETE"
        }).then((resposta) => {
            if (resposta.ok){
                return resposta.json();
            }
        }).then((dados)=>{
            alert("Produto excluído com sucesso!");
            listaDeProdutos = listaDeProdutos.filter((produto) => { 
                return produto.id !== id;
            });
            
            document.getElementById(id)?.remove(); 
        }).catch((erro) => {
            alert("Não foi possível excluir o produto: " + erro);
        });
    }
}

function obterDadosProdutos(){
    
    fetch(urlBase, {
        method:"GET"
    })
    .then((resposta)=>{
        if (resposta.ok){
            return resposta.json();
        }
    })
    .then((produtos)=>{
        listaDeProdutos=produtos;
        mostrarTabelaProdutos();
    })
    .catch((erro)=>{
        alert("Erro ao tentar recuperar produtos do servidor!");
    });
}

function cadastrarProduto(produto) {
    const existe = listaDeProdutos.some(p => p.codigo === produto.codigo);
    if (existe) {
        alert("Já existe um produto com esse código!");
        return;
    }
    fetch(urlBase, {
        "method": "POST",
        "headers": {
            "Content-Type": "application/json",
        },
        "body": JSON.stringify(produto)
    })
    .then((resposta) => {
        if (resposta.ok) {
            return resposta.json();
        }
        throw new Error('Erro na resposta do servidor');
    })
    .then((dados) => {
        if (dados && dados.id) {
            alert(`Produto incluído com sucesso! ID:${dados.id}`);
            
            produto.id = dados.id;
            listaDeProdutos.push(produto);
            mostrarTabelaProdutos();
        } else {
            throw new Error('ID não retornado pelo servidor');
        }
    })
    .catch((erro) => {
        alert("Erro ao cadastrar o produto: " + erro.message);
    });
}

obterDadosProdutos();