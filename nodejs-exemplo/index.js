const express = require('express');

const app = express();

const { lookup } = require('dns').promises;
const { hostname } = require('os');

async function getMyIPAddress(options) {
  return (await lookup(hostname(), options))
    .address;
}

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

app.get("/", async (req, res) => {

    const info = {
        ip: res.socket.remoteAddress,
        user_agent: req.get('User-Agent'),
        path: req.originalUrl,
        host_ip: await getMyIPAddress()
    };

    res.render("index",{ 
        numero:randomNumber,
        titulo:"Seja bem vindo!!", 
        conteudo:"Obrigado por acessar esta página",
        info:info
    });
})


app.listen(3000);
