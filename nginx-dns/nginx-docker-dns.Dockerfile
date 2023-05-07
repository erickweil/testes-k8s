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
#  docker run -d -p 80:80 --network public --restart unless-stopped erickweil/nginx-docker-dns