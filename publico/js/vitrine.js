function carregarProdutos() {
    fetch('https://fakestoreapi.com/products')
        .then(res => res.json())
        .then(produtos => {
            const vitrine = document.getElementById("vitrine");

            produtos.forEach(produto => {
                const card = document.createElement("div");
                card.classList.add("col-sm-6", "col-md-4", "col-lg-3");

                const estrelas = gerarEstrelas(produto.rating.rate);

                card.innerHTML = `
                    <div class="card h-100">
                        <img src="${produto.image}" class="card-img-top" alt="${produto.title}">
                        <div class="card-body d-flex flex-column justify-content-between">
                            <h5 class="card-title">${produto.title}</h5>
                            <p class="card-price">$${produto.price}</p>
                            <p class="card-rating">${estrelas} <small>(${produto.rating.count})</small></p>
                            <a href="#" class="btn btn-primary mt-auto">Comprar</a>
                        </div>
                    </div>
                `;
                vitrine.appendChild(card);
            });
        })
        .catch(erro => {
            alert("Erro ao carregar produtos: " + erro);
        });
}

function gerarEstrelas(avaliacao) {
    const cheia = '★';
    const vazia = '☆';
    const total = 5;
    const inteiras = Math.round(avaliacao);
    return cheia.repeat(inteiras) + vazia.repeat(total - inteiras);
}

carregarProdutos();
