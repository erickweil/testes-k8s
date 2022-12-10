# Testes Kubernetes

## freeCodeCamp.org
[Kubernetes Course - Full Beginners Tutorial (Containerize Your Apps!)](https://www.youtube.com/watch?v=d6WC5n9G_sM)

Kubernetes é um orquestrador de containers

permite vários servidores físicos executarem containers.

- Deploy automático de aplicações containerizadas em vários servidores
- Distribuição de Carga sobre esses servidores
- Escalabilidade Automática das aplicações
- Monitoramento e Checagem de Saúde dos containers
- Substituição de containers que falharem

não utiliza apenas docker, pode escolher entre:
- Docker
- CRI-O
- containerd

Pod é a menor unidade no mundo do Kubernetes
(Um container fica dentro de um Pod)

- Kubernetes Cluster
	Consiste de Node's, que podem ser servidores físicos ou virtuais
	Um cluster pode conter vários Nodes.
	
- Node
	Um Node pode conter vários Pods
	Tipos:
	- Master Node: Node que controla os Worker Nodes
		Serviços: kubelet, kube-proxy, container runtime, 
		API Server, Scheduler, Kube Controller Manager, Cloud Controller Manager, etcd, dns
	- Worker Node: Contém os Pods das aplicações
		Serviços: kubelet, kube-proxy, container runtime
	
- Pod
	Define uma única 'aplicação'
	é formado por:
	- containers
	- shared Volumes
	- shared IP's
	
	Um Pod é efêmero, pode ser deletado/recriado a qualquer momento
(Geralmente um Pod contém apenas 1 container)

Um Pod deve estar em contido em um único Server.

- Instalação
	Opção 1 - Cloud
	Seria possível utilizar um serviço cloud que oferece Kubernetes clusters, como
	Amazon Web Services, Google Cloud, ou outro Cloud Provider
	
	Porém, pode sair caro!
	
	Opção 2 - Instalação local

	- Minikube
	Um único Node cluster que se comporta ao mesmo tempo como um master node e um worker node
	
	O Minikube precisa de uma solução de virtualização ou containers para funcionar, e pode
	utilizar várias opções diferentes.
	
	O mais comum é:
	- Hyper-V (Preferencial caso seja Windows)
	- VirtualBox (Preferencial caso seja Mac)
	- Docker (Funcionará como um Docker dentro do Docker)
	
	- Kubectl
		'Kube Control'
		Command line tool, CLI, para remotamente gerenciar um kubernetes cluster
		
		Necessário instalar para gerenciar o Kubernetes cluster, seja ele local ou remoto no AWS
	
	
- Utilizando Kubernetes no Minikube via terminal

```
# Iniciando o minikube com Hyper-V (Executar como Admin)
# Consome aprox. 2GB de memória RAM
minikube start --driver=hyperv

# Verifica se está online
minikube status
```

Um node do minikube é uma máquina virtual, com docker instalado,
Uma vez conectado ao Node via ssh, é possível listar os containers,
serviços, etc...

```
# Listar Nodes
kubectl get nodes

# Listar pods
kubectl get pods

# Listar Namespaces
kubectl get namespaces
```

O comando 'get pods' lista os pods do namespace 'default' que é o que
é utilizado por padrão. Neste caso em uma instalação limpa está sem nenhum pod

Criando pods via terminal
```
kubectl run nginx --image=erickweil/nginx-simples

kubectl get pods

kubectl describe pod nginx
```

É possível acompanhar o status em tempo real dos pods com `kubectl get pods --watch`

> **Entrando no Node**
> 
> A qualquer momento você pode entrar via ssh no Node do Minikube e ver os containers normalmente pelos comandos do docker. Veja como funciona
> primeiro execute o comando abaixo para encontrar o ip do node minikube:
> ```
> minkube ip
> ```
> Então entre via ssh com usuário 'docker' e senha 'tcuser'
> ```
> ssh docker@IP-DO-MINIKUBE
> INSIRA A SENHA 'tcuser'
> ```

Caso você deseje ver a situação de um pod por entrar em um terminal bash ou sh, é possível pelo comando `kubectl exec`

Então uma vez que o pod esteja em execução, basta entrar nele por spawnar um processo de terminal interativo:
```bash
kubectl exec -it nginx -- sh
```
Este comando irá abrir um shell interativo que lhe permite analisar arquivos de log, processos em execução, etc... útil para diagnosticar como a aplicação está se comportando dentro do pod.

Editando as configurações de um pod

```
kubectl edit pod nginx
```

Irá abrir um editor de texto com configurações atual do pod em formato YAML. Alterando seus valores e salvando irá atualizá-lo.

Removendo pod
```
kubectl delete pod nginx
```

Expondo serviço no node
```
kubectl expose pod nginx --type='NodePort' --port=80 --target-port=80
kubectl get services
```

## Deployments

Permite vários Pods que respondem à mesma porta

```
kubectl create deployment nginx-deploy --image=erickweil/nginx-simples

kubectl get deployments

kubectl describe deployment nginx-deploy
```

Veja que o Pod é criado automaticamente.
```
kubectl get pods
```

- Escalabilidade
Com um Deployment é possível configurar vários pods para servirem um 
mesmo serviço

```
erick@DESKTOP-31T8MMQ MINGW64 /c/git/testes-k8s (main)
$ k scale deployment nginx-deploy --replicas=3
deployment.apps/nginx-deploy scaled

erick@DESKTOP-31T8MMQ MINGW64 /c/git/testes-k8s (main)
$ k get pods
NAME                            READY   STATUS    RESTARTS   AGE
nginx-deploy-79fc8f9fb5-6cf57   1/1     Running   0          9m7s
nginx-deploy-79fc8f9fb5-9nwkw   1/1     Running   0          30s
nginx-deploy-79fc8f9fb5-hl6z2   1/1     Running   0          30s

```

A qualquer momento é possível alterar a quantidade de replicas para mais ou menos
e o kubernetes irá redimensionar automaticamente o número de Pods

O Deployment irá sempre tentar manter o número de replicas especificado por você, caso por exemplo um pod tenha um erro e feche será lançado um novo para substituí-lo (Caso a aplicação tenha um erro e fique reiniciando ele para de tentar criar novos pods após um número de falhas seguidas)

Podemos testar o lançamento de novos pods em caso de falhas por criar uma falha manual: deletar um pod

Veja o que acontece:
```
PS C:\git\testes-k8s> kubectl get pods
NAME                            READY   STATUS    RESTARTS   AGE
nginx-deploy-54dbc5bdff-2q5s9   1/1     Running   0          9m13s
nginx-deploy-54dbc5bdff-8sfms   1/1     Running   0          9m23s
nginx-deploy-54dbc5bdff-mthff   1/1     Running   0          9m4s
PS C:\git\testes-k8s> kubectl delete pod nginx-deploy-54dbc5bdff-8sfms
pod "nginx-deploy-54dbc5bdff-8sfms" deleted
PS C:\git\testes-k8s> kubectl get pods
NAME                            READY   STATUS        RESTARTS   AGE
nginx-deploy-54dbc5bdff-2q5s9   1/1     Running       0          10m
nginx-deploy-54dbc5bdff-8sfms   1/1     Terminating   0          10m
nginx-deploy-54dbc5bdff-mthff   1/1     Running       0          9m56s
nginx-deploy-54dbc5bdff-npwxc   1/1     Running       0          33s
PS C:\git\testes-k8s> kubectl get pods
NAME                            READY   STATUS    RESTARTS   AGE
nginx-deploy-54dbc5bdff-2q5s9   1/1     Running   0          10m
nginx-deploy-54dbc5bdff-mthff   1/1     Running   0          10m
nginx-deploy-54dbc5bdff-npwxc   1/1     Running   0          39s
```

Veja que após algum tempo o deployment voltou a ficar com 3 pods, mesmo após o comando de parar um desses pods.

- Services

Para que a aplicação seja acessível, é necessário expor a porta
```
kubectl expose deployment nginx-deploy --port=8080 --target-port=80

kubectl get services
```

Um service permite que todos os Pods relacionados ao Deployment respondam
a um mesmo IP, com balanceamento de carga automático

MAS AINDA ESTÁ DENTRO DO KUBERNETES

(Na verdade, se tivessem vários Nodes, qualquer node no cluster seria capaz de acessar este IP)

O comando abaixo permite expor a porta para fora do Worker node.
```
kubectl expose deployment nginx-deploy --type=NodePort --port=8080 --target-port=80

(Execute como administrador:)
minikube ip
```

No caso, o serviço será acessível pelo ip do minikube, que é o Node

Execute o comando abaixo para facilmente acessar o URL:
```
C:\Windows\system32>minikube service nginx-deploy
|-----------|--------------|-------------|----------------------------|
| NAMESPACE |     NAME     | TARGET PORT |            URL             |
|-----------|--------------|-------------|----------------------------|
| default   | nginx-deploy |        8080 | http://172.19.235.61:31000 |
|-----------|--------------|-------------|----------------------------|
* Opening service default/nginx-deploy in default browser...
```

## Rolling update

É possível Alterar a imagem de um Deployment sem em nenhum momento ter perda de disponibilidade do serviço, isso é feito por manter a StretgyType do Deployment como 'RollingUpdate', que é o valor padrão, e então ao trocar a imagem ou tag da imagem dos containers de um Deployment, serão parados e atualizados 1 por 1, onde que se houver mais de 1 replica sempre haverá outros containers ativos na versão antiga ainda aceitando requisições.

Desta forma a Atualização é feita sem perda de disponibilidade pois sempre haverá containers ativos.

Como alterar a imagem:
```
kubectl set image deployment nginx-deploy nginx-simples=erickweil/nodejs-k8s-exemplo:1.0.2
```

Execute o comando a seguir em rápida sucessão para acompanhar o rollout:
```
PS C:\git\testes-k8s> kubectl rollout status deploy nginx-deploy
Waiting for deployment "nginx-deploy" rollout to finish: 1 out of 3 new replicas have been updated...
Waiting for deployment "nginx-deploy" rollout to finish: 1 out of 3 new replicas have been updated...
Waiting for deployment "nginx-deploy" rollout to finish: 1 out of 3 new replicas have been updated...
Waiting for deployment "nginx-deploy" rollout to finish: 2 out of 3 new replicas have been updated...
Waiting for deployment "nginx-deploy" rollout to finish: 2 out of 3 new replicas have been updated...
Waiting for deployment "nginx-deploy" rollout to finish: 2 out of 3 new replicas have been updated...
Waiting for deployment "nginx-deploy" rollout to finish: 1 old replicas are pending termination...
Waiting for deployment "nginx-deploy" rollout to finish: 1 old replicas are pending termination...
deployment "nginx-deploy" successfully rolled out
```

## Minikube Dashboard

É possível visualizar o status de seu cluster kubernetes minikube utilizando o dashboard do minikube.

```
minikube dashboard
```