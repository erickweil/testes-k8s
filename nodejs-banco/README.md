# Nodejs Banco

Aplicação que faz o log de todos os acessos em banco de dados MongoDB

Para usar:
```bash
docker network create net
docker run -d -p 27017:27017 \
    -e "MONGO_INITDB_ROOT_USERNAME=root" \
    -e "MONGO_INITDB_ROOT_PASSWORD=12345678" \
    -e "MONGO_INITDB_DATABASE=exemplodb" \
    --name mongodb \
    --network net mongo:latest
docker run -d -p 3000:3000 \
    -e "PUBLICPATH=/absproxy/3000/" \
    -e "MONGODB_URL=mongodb://root:12345678@mongodb:27017/exemplodb?authSource=admin
" \
    --network net \
    erickweil/nodejs-k8s-banco:2.0.0
```


