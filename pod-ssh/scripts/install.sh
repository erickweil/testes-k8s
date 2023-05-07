#!/bin/bash
apt-get update

echo "Instalar programas" 
apt-get install nano vim curl iputils-ping dnsutils git htop -y

#https://docs.docker.com/compose/install/linux/
echo "Instalar docker compose"
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/v2.17.2/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Para funcionar nano com acentos
# https://serverfault.com/questions/362903/how-do-you-set-a-locale-non-interactively-on-debian-ubuntu
LANG=${LANG:=pt_BR.UTF-8}
echo "Arrumando Locale para $LANG"
apt-get install -y locales && \
    sed -i -e "s/# $LANG.*/$LANG UTF-8/" /etc/locale.gen && \
    dpkg-reconfigure --frontend=noninteractive locales && \
    update-locale LANG=$LANG