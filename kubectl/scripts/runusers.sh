#!/bin/bash

#https://unix.stackexchange.com/questions/393091/unable-to-use-an-array-as-environment-variable
# A ideia é que exista uma env USERS com os valores dos nomes e senhas
#echo $USERS

# DELETAR DEPOIS DE REBUILDAR A IMAGEM BASE
# ----------------
#https://kubectl.docs.kubernetes.io/installation/kustomize/binaries/
curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh"  | bash
mv ./kustomize  /usr/local/bin/kustomize 
export PATH=$PATH:/usr/local/bin/kustomize

apt-get update
apt-get install -y htop
# ----------------


# Onde deve estar os arquivos base de novos usuários
mkdir -p $USERS_HOME_DIR/exemplo

# https://unix.stackexchange.com/questions/113750/use-awk-to-split-line-into-array-and-use-that-arrays-values-in-calling-shell
array=($(echo "$USERS" | sed 's/;/ /g'))
for el in "${array[@]}"; do
    usuario=${el%:*}
    senha=${el#*:}
    echo "Criando $usuario"
    /bin/bash ./newuser.sh -u $usuario -g $USERS_GROUP -d $USERS_HOME_DIR -p $senha
done

#/bin/bash ./newuser.sh -u exemplo -g kubernetes -d /home -p 12345678

echo "Iniciando SSH"
/usr/sbin/sshd -D