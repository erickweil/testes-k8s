#!/bin/bash

#https://unix.stackexchange.com/questions/393091/unable-to-use-an-array-as-environment-variable
# A ideia é que exista uma env USERS com os valores dos nomes e senhas
#echo $USERS

# --- remover depois do rebuild da imagem base
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/v2.17.2/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
# ---

# https://askubuntu.com/questions/730/how-do-i-set-environment-variables
echo "DOCKER_HOST=\"$DOCKER_HOST\"" >> /etc/environment

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