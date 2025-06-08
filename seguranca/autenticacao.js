export default function verificarAutenticacao(req, res, next) {
    const rotasLivres = ["/login", "/login.html", "/usuarios"]; 

    if (rotasLivres.includes(req.path) || req.path.startsWith("/usuarios")) {
        return next();
    }

    if (req.session.autenticado) {
        next();
    } else {
        res.redirect("/login.html");
    }
}
