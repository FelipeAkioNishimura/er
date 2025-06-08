export default function verificarAutenticacao1(requisicao,resposta,next){
    if (requisicao.session.autenticado){
        next();
    }
    else{
        resposta.redirect("/loginn.html");
    }
}
