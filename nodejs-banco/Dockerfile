FROM node:alpine
WORKDIR /app-node
ARG PORT_BUILD=3000
ENV PORT=$PORT_BUILD
ENV MONGODB_URL="mongodb://mongodb:27017/nodeaula"
ENV TITULO="CRIADO PELO DOCKER"
EXPOSE $PORT_BUILD
COPY . .
RUN npm install
ENTRYPOINT npm run devStart

# Exemplo executando
# docker build -t erickweil/nodejs-k8s-banco:2.0.0 .
# 