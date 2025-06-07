import express from 'express';
import session from 'express-session';
import verificarAutenticacao from "./seguranca/autenticacao.js";
import verificarAutenticacao1 from "./seguranca/segurancao.js"
import { v4 as uuidv4 } from 'uuid'; 
import fs from 'fs/promises';
import fetch from 'node-fetch';
const CAMINHO_ARQUIVO = './db/dados.json'; 

const host = "0.0.0.0";
const porta = 3000;
const app = express();

async function lerDados() { 
    try {
        const dados = await fs.readFile(CAMINHO_ARQUIVO, 'utf-8');
        return JSON.parse(dados);
    } catch (erro) {
        return { clientes: [], fornecedores: [], entregadores: [], categorias: [], produtos: [], usuarios: [] };
    }
}

async function escreverDados(dados) { 
    await fs.writeFile(CAMINHO_ARQUIVO, JSON.stringify(dados, null, 2));
}

app.use(session({
    secret: "M1nH4Ch4v3S3cR3t4",
    resave: true,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 15,
        httpOnly: true
    }
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 
app.use(express.static("publico"));

app.post("/login", async (req, res) => {
  const { usuario, senha } = req.body;

  try {
    const dados = await lerDados();
    const usuarios = dados.usuarios || [];

    const usuarioEncontrado = usuarios.find(u => u.usuario === usuario && u.senha === senha);

    if (usuarioEncontrado) {
      req.session.autenticado = true;
      req.session.usuario = usuarioEncontrado.usuario;
      res.redirect("./menu.html");
    } else {
      res.redirect("/login.html?erro=1");
    }

  } catch (erro) {
    console.error("Erro ao buscar usuários:", erro.message);
    res.status(500).send("Erro interno ao tentar autenticar.");
  }
});


app.use(verificarAutenticacao, express.static("privado"));

app.get("/sessao", (req, res) => {
    if (req.session.autenticado) {
        res.json({ usuario: req.session.usuario }); 
    } else {
        res.status(401).json({ erro: "Não autenticado" });
    }
});

app.get("/clientes", async (req, res) => {
    const dados = await lerDados();
    res.json(dados.clientes);
});

app.post("/clientes", async (req, res) => {
    const cliente = req.body;

    if (!cliente || !cliente.nome || !cliente.cpf) {
        return res.status(400).json({ erro: "Dados do cliente incompletos." });
    }

    const dados = await lerDados();

    const cpfJaCadastrado = dados.clientes.some(c => c.cpf === cliente.cpf);
    if (cpfJaCadastrado) {
        return res.status(409).json({ erro: "CPF já cadastrado." });
    }

    cliente.id = uuidv4(); 
    dados.clientes.push(cliente);
    await escreverDados(dados);

    res.status(201).json(cliente); 
});

app.delete("/clientes/:id", async (req, res) => {
    const { id } = req.params;
    const dados = await lerDados();

    const index = dados.clientes.findIndex(c => c.id === id);

    if (index === -1) {
        return res.status(404).json({ erro: "Cliente não encontrado." });
    }

    dados.clientes.splice(index, 1);
    await escreverDados(dados);

    res.status(200).json({ mensagem: "Cliente excluído." });
});

app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login.html");
    });
});
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------
app.get("/fornecedores", async (req, res) => {
    const dados = await lerDados();
    res.json(dados.fornecedores);
});

app.post("/fornecedores", async(req, res) => {
    const fornecedor = req.body;

    if (!fornecedor || !fornecedor.nomeFornecedor) {
        return res.status(400).json({ erro: "Dados do fornecedor incompletos." });
    }

    fornecedor.id = uuidv4(); 
    const dados = await lerDados();
    dados.fornecedores.push(fornecedor);
    await escreverDados(dados);

    res.status(201).json(fornecedor); 
});

app.delete("/fornecedores/:id", async(req, res) => {
    const { id } = req.params;
    const dados = await lerDados();

    const index = dados.fornecedores.findIndex(c => c.id === id);

    if (index === -1) {
        return res.status(404).json({ erro: "fornecedor não encontrado." });
    }

    dados.fornecedores.splice(index, 1);
    await escreverDados(dados);

    res.status(200).json({ mensagem: "fornecedor excluído." });
});
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------

app.get("/produtos", async (req, res) => {
    const dados = await lerDados();
    res.json(dados.produtos);
});

app.post("/produtos", async(req, res) => {
    const produto = req.body;

    if (!produto || !produto.codigo) {
        return res.status(400).json({ erro: "Dados de produtos incompletos." });
    }

    produto.id = uuidv4(); 
    const dados = await lerDados();
    dados.produtos.push(produto);
    await escreverDados(dados);

    res.status(201).json(produto); 
});

app.delete("/produtos/:id", async(req, res) => {
    const { id } = req.params;
    const dados = await lerDados();

    const index = dados.produtos.findIndex(c => c.id === id);

    if (index === -1) {
        return res.status(404).json({ erro: "Produto não encontrado." });
    }

    dados.produtos.splice(index, 1);
    await escreverDados(dados);

    res.status(200).json({ mensagem: "Produto excluído." });
});
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------
app.get("/entregadores", async (req, res) => {
    const dados = await lerDados();
    res.json(dados.entregadores);
});

app.post("/entregadores", async (req, res) => {
    const entregador = req.body;

    if (
        !entregador || 
        !entregador.nome || 
        !entregador.cpf || 
        !entregador.telefone || 
        !entregador.meioTransporte || 
        !entregador.placaVeiculo
    ) {
        return res.status(400).json({ erro: "Dados do entregador incompletos." });
    }

    entregador.id = uuidv4(); 
    const dados = await lerDados();
    dados.entregadores = dados.entregadores || []; 
    dados.entregadores.push(entregador);
    await escreverDados(dados);

    res.status(201).json(entregador);
});

app.delete("/entregadores/:id", async (req, res) => {
    const { id } = req.params;
    const dados = await lerDados();

    const index = dados.entregadores.findIndex(e => e.id === id);

    if (index === -1) {
        return res.status(404).json({ erro: "Entregador não encontrado." });
    }

    dados.entregadores.splice(index, 1);
    await escreverDados(dados);

    res.status(200).json({ mensagem: "Entregador excluído." });
});
//-----------------------------------------------------------------------------------------------------------------------------------------------------------------
app.get("/categorias", async (req, res) => {
    const dados = await lerDados();
    res.json(dados.categorias);
});

app.post("/categorias", async (req, res) => {
    const categoria = req.body;

    if (
        !categoria ||
        !categoria.nome ||
        !categoria.descricao ||
        !categoria.status
    ) {
        return res.status(400).json({ erro: "Dados da categoria incompletos." });
    }

    categoria.id = uuidv4(); 
    const dados = await lerDados();
    dados.categorias = dados.categorias || []; 
    dados.categorias.push(categoria);
    await escreverDados(dados);

    res.status(201).json(categoria);
});

app.delete("/categorias/:id", async (req, res) => {
    const { id } = req.params;
    const dados = await lerDados();
    const index = dados.categorias.findIndex(c => c.id === id);
    if (index === -1) {
        return res.status(404).json({ erro: "Categoria não encontrada." });
    }
    dados.categorias.splice(index, 1);
    await escreverDados(dados);
    res.status(200).json({ mensagem: "Categoria excluída." });
});
//------------------------------------------------------------------------------------------------------------------------------------------------------------------
app.get("/usuarios", async (req, res) => {
    const dados = await lerDados();
    res.json(dados.usuarios);
});

app.post("/usuarios", async (req, res) => {
    const usuario = req.body;

    if (
        !usuario ||
        !usuario.usuario ||
        !usuario.email ||
        !usuario.senha
    ) {
        return res.status(400).json({ erro: "Dados da usuario incompletos." });
    }

    usuario.id = uuidv4(); 
    const dados = await lerDados();
    dados.usuarios = dados.usuarios || []; 
    dados.usuarios.push(usuario);
    await escreverDados(dados);

    res.status(201).json(usuario);
});

app.delete("/usuarios/:id", async (req, res) => {
    const { id } = req.params;
    const dados = await lerDados();
    const index = dados.usuarios.findIndex(c => c.id === id);
    if (index === -1) {
        return res.status(404).json({ erro: "Usuario não encontrada." });
    }
    dados.usuarios.splice(index, 1);
    await escreverDados(dados);
    res.status(200).json({ mensagem: "Usuario excluída." });
});
app.listen(porta, host, () => {
    console.log(`Servidor em execução em http://${host}:${porta}`);
});