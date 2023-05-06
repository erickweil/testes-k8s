# Docker in Docker
É possível ter acesso ao docker dentro de uma imagem docker!

A único problema é que se não forem mapeados volumes, ao deletar o container serão apagados todos os arquivos das imagens que poderiam servir de cache. (que são salvos em /var/lib/docker no docker daemon)

O docker é na verdade duas coisas, o docker daemon e o docker cli

## dockerd (Docker Daemon)
Para executar um docker daemon dentro do docker, utiliza-se a imagem docker:dind (que precisa ser inicializada com a opção privileged)