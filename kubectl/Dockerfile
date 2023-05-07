FROM erickweil/container-ssh:latest

WORKDIR /root

# Diretório que será usado para criar as pastas dos usuários
ENV USERS_HOME_DIR="/home"

# Grupo no qual os usuários farão parte
ENV USERS_GROUP="kubernetes"

COPY ./scripts/ .
RUN chmod +x ./install_kubectl.sh && /bin/bash ./install_kubectl.sh