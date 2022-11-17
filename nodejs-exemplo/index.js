import express from "express";

const app = express();



// Permite receber valores do POST como urlencoded e json
app.use(express.urlencoded({extended: true}));
app.use(express.json());

//app.use(expressLayouts);
//app.set("layout","./layouts/default");

// Configura o View Engine para utilizar o EJS
app.set('view engine','ejs');

// Realizar um log de todas as páginas que forem acessadas:
// originalUrl contém o caminho da requisição HTTP
function logger(req,res,next) {
    console.log(req.originalUrl);
    next();
}
app.use(logger);

// Static Files
app.use(express.static('public'));

// Gerado uma vez só na inicialização
const randomNumber = Math.floor(Math.random() * 10000) + 1;

app.get("/", (req, res) => {
    res.render("index",{ 
        numero:randomNumber,
        titulo:"Seja bem vindo!", 
        conteudo:"Obrigado por acessar esta página" 
    });
})


app.listen(3000);
