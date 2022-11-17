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