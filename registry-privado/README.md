# Como configurar acesso a um Registry Privado no Kubernetes

Baseado em https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/

Imagens publicamente acessíveis não há problema nenhum em utilizar, porém uma vez que precisar um registry privado, isto é, que necessita de usuario e senha especificos para utilizar, precisa-se informar ao kubernetes que credenciais utilizar, através de uma configuração 'kubernetes.io/dockerconfigjson'

O jeito mais fácil é copiar do config do próprio docker:

1. Em sua máquina, faça `docker login` em seu registry privado
2. Abra o arquivo ~/.docker/config.json e extraia a parte que é referente ao seu registry privado:
```
{
    "auths": {
        ...
        "seudominio.com": {
            "auth": "c3R...zE2"
        }
        ...
    }
}
```

Salve em dockerconfig.json, e então faça o comando abaixo:

```bash
kubectl create secret generic regcred \
    --from-file=.dockerconfigjson=dockerconfig.json \
    --type=kubernetes.io/dockerconfigjson
```

> Ou então, gere o arquivo secret manualemente por transformar o dockerconfig.json em base64 e construa o yaml do secret com a chave .dockerconfigjson recebendo este valor.

## Utilizando o registry privado em um Pod

A seguir temos o yaml de um Pod que irá utilizar o secret 'regcred' criado acima para autenticar em um registry privado em 'seudominio.com':

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: private-reg
spec:
  containers:
  - name: private-reg-container
    image: seudominio.com/joao/imagem-teste:latest
  imagePullSecrets:
  - name: regcred
```