# PersistentVolumes e PersistentVolumeClaims

A Maioria das aplicações necessitam de dados persistentes, isto é, você não quer que seu banco de dados inteiro seja deletado e re-criado do zero a cada reinício do servidor, certo?

Para que seja possível armazenar informações de forma persistente em um pod ou deployment no kubernetes, é necessário utilizar de PersistentVolumes.

## Exemplo de  Configuração utilizando Provisioner

O kubernetes possui uma forma de alocar volumes de forma gerenciada utilizando um gerenciador de armazenamento.

Porém, no nosso caso, utilizando Minikube, há apenas o provisioner hostPath
```bash
$ minikube kubectl -- get storageclasses
NAME                 PROVISIONER                RECLAIMPOLICY   VOLUMEBINDINGMODE   ALLOWVOLUMEEXPANSION   AGE
standard (default)   k8s.io/minikube-hostpath   Delete          Immediate           false                  26d
```

E em um cluster kubernetes k3s (mais informações em https://k3s.io/), vem por padrão o local-path provisioner.
```bash
$ kubectl get storageclasses
NAME                   PROVISIONER             RECLAIMPOLICY   VOLUMEBINDINGMODE    ALLOWVOLUMEEXPANSION   AGE
local-path (default)   rancher.io/local-path   Delete          WaitForFirstConsumer   false                  3d21h
```

Você pode analisar a documentação oficial do kubernetes para uma lista de possíveis provisioners https://kubernetes.io/docs/concepts/storage/storage-classes/
Entre possíveis provisioners, nota-se a ideia de que eles podem ser remotos ao servidor, isto é, um disco via um serviço como NFS ou outro tipo de volume por rede, mas fica completamente transparente à aplicação, pois não é necessária configuração alguma, para a aplicação é apenas um caminho de diretório como qualquer outro.

Veja na listagem está destacado com (default) o provisioner padrão, onde que é possível definir um volume que utilize desta storage class com apenas uma configuração de PersistentVolumeClaim sem especificar nenhuma chave de que classe deve utilizar e então irá funcionar em qualquer um desses dois casos (k3s e minikube)

Veja o exemplo abaixo onde que um PersistentVolumeClaim é criado e então utilizado por um deployment:

weilplace/weilplace-api.yaml
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: weilplace-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 128Mi
```

E então o deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: weilplace-api-deploy
spec:
  replicas: 1
  selector:
    matchLabels:
      app: weilplace-api-deploy
  template:
    metadata:
      labels:
        app: weilplace-api-deploy
    spec:
      containers:
      - name: weilplace-api-deploy
        image: erickweil/weilplace-api:latest
        envFrom:
          - configMapRef:
              name: weilplace-cm
        args: ["-placedelay","$(PLACEDELAY)","-size","$(SIZE)"]
        resources: {}
        ports:
        - containerPort: 8090
        volumeMounts:
          - mountPath: /opt/app/img
            name: pv
      volumes:
      - name: pv
        persistentVolumeClaim:
          claimName: weilplace-pvc
```
Veja que há duas chaves, a chave volumeMonts no container, que especifica o caminho local do volume dentro do container, e então na lista volumes há a especificação do claim que deve ser utilizado.

## Explorando arquivos em um PersistentVolumeClaim

Um mesmo PersistentVolumeClaim pode ser utilizado por vários Pods. Inclusive isto se torna útil uma vez que se deseja explorar os arquivos criados neste volume. É possível por exemplo utilizar ferramentas web para navegar no volume, um desses sistemas é o filegator.

O acesso padrão é feito com usuário admin e senha admin123

Veja a configuração para que seja possível explorar o conteúdo do weilplace-pvc criado anteriormente.

filebrowser/deployment.yaml
```yaml
# Exemplo de Deployment que permite explorar arquivos em um volume
# A ideia é colocar em claimName o nome do volume claim que deseja explorar
# Documentação do FileGator: https://filegator.io/
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: filebrowser
spec:
  selector:
    matchLabels:
      app: filebrowser
  template:
    metadata:
      labels:
        app: filebrowser
    spec:
      containers:
      - name: filebrowser
        image: filegator/filegator
        resources: {}
        ports:
        - containerPort: 8080
        volumeMounts:
          - mountPath: /var/www/filegator/repository/weilplace
            name: pv
      volumes:
      - name: pv
        persistentVolumeClaim:
          claimName: weilplace-pvc # Escolha aqui o volume claim
---
apiVersion: v1
kind: Service
metadata:
  name: filebrowser
spec:
  type: NodePort
  selector:
    app: filebrowser
  ports:
  - port: 8080
    targetPort: 8080
    nodePort: 31102 # escolha uma porta que não esteja ocupada
```

E então basta acessar a página e entrar com as credenciais padrão. (user: admin, password: admin123)

## FAQ

### O que acontece quando o Pod ou o Deployment que usa o volume é deletado?
R: Apenas o Pod ou o deployment é deletado, o volume não será deletado.

### O que acontece se o PersistentVolumeClaim for deletado?
R: Por padrão, isto causará que o volume (E todos os dados nele) serão deletados. Porém é possível modificar este comportamento alterando o "Reclaim Policy" do volume correspondente. Veja https://kubernetes.io/docs/tasks/administer-cluster/change-pv-reclaim-policy/