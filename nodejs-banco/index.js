const express = require('express');
const expressLayouts = require('express-ejs-layouts');

const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const dbURL = 'mongodb://'+process.env.MONGODB_HOST+':'+process.env.MONGODB_PORT+'/nodeaula';
console.log("Conectando no banco:"+dbURL);
mongoose.connect(dbURL);

const modelAcesso = require('./models/logacesso');


const { lookup } = require('dns').promises;
const { hostname } = require('os');

async function getMyIPAddress(options) {
  return (await lookup(hostname(), options))
    .address;
}

const app = express();

app.set('view engine', 'ejs')

app.use(expressLayouts)
app.set("layout","./layouts/default");


// Permite receber valores do POST como urlencoded e json
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// Oferecer arquivos estáticos em './public/'
app.use(express.static('public'));

app.get("/", async (req, res) => {

    const ip = res.socket.remoteAddress;
    const user_agent = req.get('User-Agent');
    const path = req.originalUrl;

    await modelAcesso.create({
        ip: ip,
        user_agent: user_agent,
        path: path,
    });

    const listagem = await modelAcesso.find({})
    .sort({data:-1})
    .limit(32)
    ;

    const host_ip = await getMyIPAddress();


    res.render("index",{ 
        titulo:process.env.TITULO,
        ip:host_ip,
        listagem:listagem
    });
})


app.listen(process.env.PORT);

