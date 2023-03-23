FROM kubectl-base

WORKDIR /root

# Diretório que será usado para criar as pastas dos usuários
ENV USERS_HOME_DIR="/home"

# Grupo no qual os usuários farão parte
ENV USERS_GROUP="kubernetes"

# Variável de ambiente que controla que usuários serão criados
ENV USERS="primeiro:12345678;segundo:12345678;terceiro:12345678"

# exemplo RUN /bin/bash ./newuser.sh -u fslab -g kubernetes -d /home -p 123456

COPY ./scripts/ .
RUN chmod +x ./runusers.sh
RUN chmod +x ./newuser.sh

# Start SSH service
RUN service ssh start
# Expose docker port 22
EXPOSE 22

ENTRYPOINT ["./runusers.sh"]