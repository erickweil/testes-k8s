# Dockerfile para criar o docker-dns, que encaminha para containers docker
FROM nginx:alpine

ENV NGINX_PORT="80"
ENV SERVER_NAME="\\.app\\.fslab\\.dev"

ENV DOMAIN_PREFIX="docker\-"

# Para executar meus scripts antes do entrypoint
COPY ./before-entrypoint.sh /before-entrypoint.sh
RUN chmod +x /before-entrypoint.sh

COPY ./default.conf /etc/nginx/templates/default.conf.template

ENTRYPOINT ["sh","/before-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

# docker build -t erickweil/nginx-docker-dns -f nginx-docker-dns.Dockerfile .
# docker network create public

# Executar uma vez:
# docker -H tcp://docker:2375  run -e DOMAIN_PREFIX='docker\-'  -d -p 80:80 --restart on-failure:10 --network public --name nginx-docker-dns erickweil/nginx-docker-dns
# docker -H tcp://docker2:2375 run -e DOMAIN_PREFIX='docker2\-' -d -p 80:80 --restart on-failure:10 --network public --name nginx-docker-dns erickweil/nginx-docker-dns
