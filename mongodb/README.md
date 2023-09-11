## Criando um Banco de Dados MongoDB com usuário e banco inicial
https://hub.docker.com/_/mongo/

> **Environment Variables**
>
> `MONGO_INITDB_ROOT_USERNAME`, `MONGO_INITDB_ROOT_PASSWORD`
>
> Essas variáveis, usadas em conjunto, criam um novo usuário e definem a senha desse usuário. Este usuário é criado no banco de dados de autenticação de admin e recebe a função de root, que é uma função de "superusuário".

> **MONGO_INITDB_DATABASE**
>
> Esta variável permite que você especifique o nome de um banco de dados a ser usado para scripts de criação em `/docker-entrypoint-initdb.d/*.js` *(veja Inicializando uma nova instância abaixo)*. O MongoDB foi projetado fundamentalmente para "criar no primeiro uso", portanto, se você não inserir dados com seus arquivos JavaScript, nenhum banco de dados será criado.
>
> **Initializing a fresh instance**
>
> Quando um contêiner é iniciado pela primeira vez, ele executará arquivos com extensões .sh e .js encontrados em /docker-entrypoint-initdb.d. Os arquivos serão executados em ordem alfabética. Os arquivos .js serão executados pelo mongosh (mongo nas versões abaixo de 6) usando o banco de dados especificado pela variável MONGO_INITDB_DATABASE, se estiver presente, ou teste caso contrário. Você também pode alternar bancos de dados dentro do script .js.

Segundo a documentação do próprio MongoDB, há várias formas de iniciar o banco quando ele for criado a primeira vez com um usuário, senha e database.

## Iniciando o banco com Variáveis de Ambiente
É possível configurar o MongoDB utilizando algumas variáveis de ambiente, 
- `MONGO_INITDB_ROOT_USERNAME` (Nome de usuário root)
- `MONGO_INITDB_ROOT_PASSWORD` (Senha do usuário root)
- `MONGO_INITDB_DATABASE` (Banco inicial que será criado)

> Obs: é necessário especificar o usuário e senha root para que autenticação no banco seja ativada. Mesmo que você planeje criar outro usuário depois isto é necessário para ser possível autenticar.

Caso usuário seja root, a senha 12345678 e database inicial exemplodb fica assim a string de conexão:
mongodb://root:12345678@localhost:27017/exemplodb?authSource=admin

## Configurando o banco com Scripts
No momento que o container for iniciado os scripts bash `*.sh` e javascript `*.js` no diretório `/docker-entrypoint-initdb.d/` serão executados na database `MONGO_INITDB_DATABASE` (Que por padrão é **test**)

Por copiar um script neste diretório, é possível iniciar o banco com nossa própria regra de criação, especificando usuários e databases.

Veja o conteúdo de um script que cria um novo usuário no banco e dá permissão à database exemplodb para ele.
```
db.createUser({
  user: "usuario",
  pwd: "senha",
  roles: [
    {
      role: "readWrite",
      db: "exemplodb"
    }
  ]
});
```