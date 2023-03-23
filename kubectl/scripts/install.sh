#!/bin/bash
echo "Instalar Kubectl" #https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/
apt-get update
apt-get install -y ca-certificates curl
curl -fsSLo /etc/apt/keyrings/kubernetes-archive-keyring.gpg https://packages.cloud.google.com/apt/doc/apt-key.gpg
echo "deb [signed-by=/etc/apt/keyrings/kubernetes-archive-keyring.gpg] https://apt.kubernetes.io/ kubernetes-xenial main" | tee /etc/apt/sources.list.d/kubernetes.list
apt-get update
apt-get install -y kubectl

echo "Instalar nano"
apt-get install -y nano

echo "Instalar ping"
apt update
apt install -y iputils-ping

echo "Instalar git"
apt install -y git

echo "Instalar ssh" #https://goteleport.com/blog/shell-access-docker-container-with-ssh-and-docker-exec/
apt install -y openssh-server sudo