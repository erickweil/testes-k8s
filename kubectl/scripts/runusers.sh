#!/bin/bash

#https://unix.stackexchange.com/questions/393091/unable-to-use-an-array-as-environment-variable
# A ideia é que exista uma env USERS com os valores dos nomes e senhas
#echo $USERS

# https://askubuntu.com/questions/730/how-do-i-set-environment-variables
echo $DOCKER_HOST >> /etc/environment

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