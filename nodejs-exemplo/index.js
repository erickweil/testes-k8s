const express = require('express');

const app = express();

const { lookup } = require('dns').promises;
const { hostname } = require('os');

const { promisify } = require('util');
const exec = promisify(require('child_process').exec)
require('dotenv').config();

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

const getInfo = async (req,res) => {
    return {
        publicpath: process.env.PUBLICPATH,
        numero: randomNumber,
        ip: res.socket.remoteAddress,
        user_agent: req.get('User-Agent'),
        path: req.originalUrl,
        host_ip: await getMyIPAddress()
    };
}

const execute = async (command) => {
    try{
    return await exec(command);
    }
    catch(err) {
        return {stdout:"",stderr:""+err}
    }
};

let router = express.Router()
app.use(process.env.PUBLICPATH,router)

router.get("/", async (req, res) => {

    const info = await getInfo(req,res)

    res.render("index",{
        titulo:"Olá!", 
        conteudo:"Testes com Kubernetes e GitLab",
        info:info
    });
})

router.get("/terminal", async (req, res) => {

    const info = await getInfo(req,res)

    res.render("terminal",{
        titulo:"Terminal", 
        conteudo:"Digite o comando e ele será exibido abaixo:",
        cmd:"",
        info:info
    });
})


router.post("/terminal", async (req, res) => {

    const info = await getInfo(req,res)
    const output = await execute(req.body.cmd)
    res.render("terminal",{
        titulo:"Terminal", 
        conteudo:"Digite o comando e ele será exibido abaixo:",
        cmd:(""+output.stdout)+(""+output.stderr),
        info:info
    });
})

app.get("*", async (req, res) => {

    res.status(404).send("Caminho "+req.originalUrl+" sem conteúdo")

})

app.listen(3000);
