# Testes Kubernetes

## Curso do canal do youtube: TechWorld With Nana
[Kubernetes Crash Course for Absolute Beginners](https://www.youtube.com/watch?v=s_o8dwzRlu4&t=2324s)

- Definição
	- Orquestrador de containers
	- Open source
	- Desenvolvido pelo Google
	- Ajuda a gerenciar aplicações containerizadas
	
- Monolith --> Microservices
	Microservices aumentaram uso de containers
	necessário automatizar gerência de centenas de containers

- Orquestrador
	- Availability: no downtime
	- Scalability: load based
	- Disaster Recovery: backup and restore
	
- Arquitetura do Kubernetes
	Pelo menos 1 'master' node
	vários 'worker' nodes, chamados 'kubelet'
	cada 'worker' node pode conter 1 ou mais containers
	
	- Master node
		Contém o API Server (UI, API, CLI)
		Controller Manager - Monitaremento
		Scheduler - Decide onde colocar containers
		Etcd - Configuração de cada node/container
		
		Importante: é interessante ter 2 ou mais master nodes
		para impedir que um problema cause toda a aplicação cair
		
	- Virtual Network
		Conecta todos os 'worker' nodes entre si como se 
		estivessem em uma mesma máquina
		
	- Worker Nodes
		Maiores e mais poderosos
		
- Componentes
	- Node
		Máquina virtual ou física
		
	- Pod
		Menor unidade no Kubernetes
		Abstratação em containers
		
		É possível vários containers em um Pod
		
		- Geralmente 1 Aplicação por Pod
		- Cada Pod possui um IP (Novo a cada reinício)
	
	- Controle de IP/Conexões
		- Service
			IP permanente
			Mesmo que o Pod reinicie o Service mantém o IP
			
			- Permite vários Pods/Nodes
			- Balanceador de carga
			
		- External Service
			Abre a comunicação para fora
			Utiliza o IP do Node
			
		- Ingress
			Funciona como um proxy reverso?
			DNS?

	- Configurações
		- Config Map
			Permite configurar sem realizar re-build das imagens dos containers
			PLAINTEXT	
			
		- Secret
			Configurar dados de credenciais
			BASE64
			é possível ativar a criptografia (DESATIVADA POR PADRÃO)
		
	- Volume
		Armazenamento local ou remoto
	
	- Abstração em Pods 'blueprints'
		- Deployments
			Permite criarvárias réplicas de um Pod 'on demand'
			Abstração em Pods
			Funciona para aplicações State-less

		- Statefulset
			São como Deployments mas para aplicações com estado
			Ex: Mysql, MongoDB, Elastic
			
			Leituras e Escritas aos Volumes são sincronizadas
			
			Complicado de lidar, é comum manter o banco de dados fora do Kubernetes
		
- Arquivos de configuração
	- YAML
```
		apiVersion: v1
		kind: Service
		metadata:
			name: nginx-service
		spec:
			replicas: 2
			selector:
			ports:
```
	- Estrutura
		1. Metadata
		2. Especificação 
		3. status (Gerado automaticamente pelo Kubernetes)
			Irá verificar o status atual vs status ideal
			(REACT?)
			etcd
			
	Interessante manter os arquivos YAML no repositório git do projeto
	
- Minikube & Kubectl
	
	Minikube Permite ter Master Process e Nodes Process em um único Node
	Instalação para testes do Kubernetes em um computador normal.
	
	
	Kubectl é um auxiliar de linha de comando para gerenciar o Kubernetes cluster
	

	
	https://www.itechtics.com/enable-hyper-v-windows-10-home/#google_vignette
	
	```
	//Iniciando Minikube cluster:
	minikube start --driver=hyperv
	
	//Checar status
	minikube status
	```
	- Kubectl
	```
	kubectl get node
	```
	
	https://kubernetes.io/docs/concepts/configuration/configmap/
	'mongo-config.yaml'
	```
	apiVersion: v1
	kind: ConfigMap
	metadata:
	  name: mongo-config
	data:
	  mongo-url: mong-service
	```
	
	https://kubernetes.io/docs/concepts/configuration/secret/
	'mongo-secret.yaml'
	```
	apiVersion: v1
	kind: Secret
	metadata:
	  name: mongo-secret
	type: Opaque
	data:
	  mongo-user: bW9uZ291c2Vy
	  mongo-password: bW9uZ29wYXNzd29yZA==
	```
	
	Deployment & Service in one file  
	https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
	'mongo.yaml'
	```
	apiVersion: apps/v1
	kind: Deployment
	metadata:
	  name: mongo-deployment
	  labels:
		app: mongo
	spec:
	  replicas: 1
	  selector:
		matchLabels:
		  app: mongo
	  template:
		metadata:
		  labels:
			app: mongo
		spec:
		  containers:
		  - name: mongodb
			image: mongo:5.0
			ports:
			- containerPort: 27017
			env:
			- name: MONGO_INITDB_ROOT_USERNAME
			  valueFrom:
			    secretKeyRef:
				  name: mongo-secret
				  key: mongo-user
			- name: MONGO_INITDB_ROOT_PASSWORD
			  valueFrom:
			    secretKeyRef:
				  name: mongo-secret
				  key: mongo-password
	---
	apiVersion: v1
	kind: Service
	metadata:
	  name: mongo-service
	spec:
	  selector:
		app: mongo
	  ports:
		- protocol: TCP
		  port: 27017
		  targetPort: 27017
	```
	
	'webapp.yaml'
	```
	apiVersion: apps/v1
	kind: Deployment
	metadata:
	  name: webapp-deployment
	  labels:
		app: webapp
	spec:
	  replicas: 1
	  selector:
		matchLabels:
		  app: webapp
	  template:
		metadata:
		  labels:
			app: webapp
		spec:
		  containers:
		  - name: webapp
			image: nanajanashia/k8s-demo-app:v1.0
			ports:
			- containerPort: 3000
			env:
			- name: USER_NAME
			  valueFrom:
			    secretKeyRef:
				  name: mongo-secret
				  key: mongo-user
			- name: USER_PWD
			  valueFrom:
			    secretKeyRef:
				  name: mongo-secret
				  key: mongo-password
			- name: DB_URL
			  valueFrom:
			    configMapKeyRef:
				  name: mongo-config
				  key: mongo-url
	---
	apiVersion: v1
	kind: Service
	metadata:
	  name: webapp-service
	spec:
	  type: NodePort
	  selector:
		app: webapp
	  ports:
		- protocol: TCP
		  port: 3000
		  targetPort: 3000
		  nodePort: 30100
	```
		  
-- Comandos

kubectl apply -f mongo-config.yaml
kubectl apply -f mongo-secret.yml
kubectl apply -f mongo.yaml
kubectl apply -f webapp.yaml

kubectl get all
kubectl get pods

kubectl describe service webapp-service

kubectl get svc

admin: minikube ip


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

# IP da máquina virtual Worker Node
minikube ip

# Acessando o node kubernetes vias ssh
ssh docker@172.19.235.61
(Usuário: docker, senha: tcuser)

```

Um node do minikube é uma máquina virtual, com docker instalado,
Uma vez conectado ao Node via ssh, é possível listar os containers,
serviços, etc...

(comandos abaixo estão fora da máquina, saia do ssh primeiro)
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

(A qualquer momento você pode entrar via ssh no Worker Node e gerenciar o container normalmente
pelos comandos do docker)

Removendo pod
```
kubectl delete pod nginx
```

## Deployments

Permite vários Pods que respondem à mesma porta

```
kubectl create deployment nginx-deploy --image=erickweil/nginx-simples

kubectl get deployments

k describe deployment nginx-deploy
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
kubectl expose deployment nginx-deploy --type=NodePort --port=8080

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
## Montando um Deployment de SUA APLICAÇÃO do ZERO

Arquivos finais: https://github.com/bstashchuk/k8s

