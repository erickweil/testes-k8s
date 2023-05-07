#!/bin/bash
apt-get update

echo "Instalar programas" #https://goteleport.com/blog/shell-access-docker-container-with-ssh-and-docker-exec/
apt-get install openssh-server sudo nano curl iputils-ping dnsutils git htop -y

echo "Instalar docker compose"
#https://docs.docker.com/compose/install/linux/
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/v2.17.2/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose