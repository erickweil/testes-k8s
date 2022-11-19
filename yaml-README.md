# Entendendo as configurações YAML

> Recomendado:
> Instale o plugin do VSCode "Kubernetes" para melhor produtividade criando estes arquivos de configurações

## Criando a configuração de um Deployment

No root de seu projeto, crie um arquivo deployment.yaml

Este arquivo contém a configuração da criação de um Deployment, com as informações da imagem do container, portas a serem expostas, etc...

> Toda essa configuração é feita como definido na documentação oficial do kubernetes: https://kubernetes.io/docs/reference/kubernetes-api/workload-resources/deployment-v1/

Veja a configuração para um serviço simples do nodejs que escuta na porta 3000:
`deployment.yaml`
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nodejs-deploy
spec:
  selector:
    matchLabels:
      app: nodejs-deploy
  template:
    metadata:
      labels:
        app: nodejs-deploy
    spec:
      containers:
      - name: nodejs-deploy
        image: erickweil/nodejs-k8s-exemplo:1.0.2
        resources:
          limits:
            memory: "128Mi"
            cpu: "500m"
        ports:
        - containerPort: 3000
```

Vamos entender alguns dos valores:
- containers
    Contém uma lista de entradas, uma para cada container, neste exemplo há apenas um container
- image
    Este é o nome da imagem que será utilizada para o container
- ports
    Define a porta que o container irá estar esperando conexões
- limits
  - memory: Define o limite de memória de cada container
  - cpu: Define o limite de uso de cpu de cada container, (500m) define um máximo de 50% de utilização do cpu

### Criando Deployment com um arquivo yaml 
Com um terminal no mesmo diretório do arquivo de configuração do deployment, é possível criar um deployment com o comando:
```
kubectl apply -f .\deployment.yaml
```

### Atualizando um Deployment

O arquivo de configuração acima não define um número de replicas no Deployment, então é criado com o valor padrão 1. Vamos modificar o arquivo de configuração de forma a iniciar com 5 replicas:
`deployment.yaml`
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nodejs-deploy
spec:
  replicas: 5 # Linha adicionada
  selector:
...
```

Agora basta executar o comando apply novamente:
```
kubectl apply -f .\deployment.yaml
```

## Configurando um Service .yaml

Da mesma forma que é possível configurar um Deployment utilizando um arquivo .yaml, é possível configurar um Service.

Veja como fica para que a aplicação nodejs que escuta na porta 3000 nos containers esteja disponível na porta 31000 do minikube node:
`service.yaml`
```yaml
apiVersion: v1
kind: Service
metadata:
  name: nodejs-deploy
spec:
  type: NodePort
  selector:
    app: nodejs-deploy
  ports:
  - port: 3000
    targetPort: 3000
    nodePort: 31000
```

Aplique o serviço da mesma forma:
```
kubectl apply -f .\service.yaml
```