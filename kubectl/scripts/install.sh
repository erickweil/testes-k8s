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

echo "Instalar nslookup"
apt install -y dnsutils

echo "Instalar git"
apt install -y git

echo "Instalar ssh" #https://goteleport.com/blog/shell-access-docker-container-with-ssh-and-docker-exec/
apt install -y openssh-server sudo


echo "Instalar kustomize"
#https://kubectl.docs.kubernetes.io/installation/kustomize/binaries/
curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh"  | bash
mv ./kustomize  /usr/local/bin/kustomize 
export PATH=$PATH:/usr/local/bin/kustomize

echo "Instalar htop"
apt-get install -y htop

# -- Não fez rebuild daqui para frente ainda

#https://docs.docker.com/compose/install/linux/
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/v2.17.2/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose