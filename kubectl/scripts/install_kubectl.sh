#!/bin/bash
echo "Instalar Kubectl" #https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/
apt-get update
apt-get install -y ca-certificates
curl -fsSLo /etc/apt/keyrings/kubernetes-archive-keyring.gpg https://packages.cloud.google.com/apt/doc/apt-key.gpg
echo "deb [signed-by=/etc/apt/keyrings/kubernetes-archive-keyring.gpg] https://apt.kubernetes.io/ kubernetes-xenial main" | tee /etc/apt/sources.list.d/kubernetes.list
apt-get update
apt-get install -y kubectl

echo "Instalar kustomize"
#https://kubectl.docs.kubernetes.io/installation/kustomize/binaries/
curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh"  | bash
mv ./kustomize  /usr/local/bin/kustomize 
export PATH=$PATH:/usr/local/bin/kustomize