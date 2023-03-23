FROM ubuntu:latest

WORKDIR /root

COPY ./scripts/. .

RUN /bin/bash ./install.sh

# Start SSH service
RUN service ssh start
# Expose docker port 22
EXPOSE 22
ENTRYPOINT ["/usr/sbin/sshd","-D"]
#ENTRYPOINT [ "sleep", "infinity" ]