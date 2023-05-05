# Nginx Dns
A ideia é prover uma forma de que acessos a um subdomínio sejam encaminhados a hosts visíveis localmente pelo nginx.

Considerando um espaço dns onde há hosts *.local e um domínio público com dns wildcard *.exemplo.com
O nome batata.exemplo.com iria encaminhar para o host batata.local

Dentro de um cluster Kubernetes os serviços possuem hostnames padrão baseados no nome, namespace e idenficador do nodo. (Veja https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/#Services)
Considerando o serviço 'batata' no namespace 'default' em um cluster com domínio 'cluster.local' o hostname do serviço seria: 'batata.default.svc.cluster.local'

Porém, para resolver esse nome de host é necessário utilizar o servidor dns apropriado, isto é feito acessando o arquivo /etc/resolv.conf que é colocado em qualquer Pod em um cluster kubernetes com algo parecido com isso:

```conf
search default.svc.cluster.local svc.cluster.local cluster.local 1.1.1.1
nameserver 10.43.0.10
options ndots:5
```
(Veja https://www.man7.org/linux/man-pages/man5/resolv.conf.5.html)

> É possível extrair o nameserver dele e gerar a linha que deve ir no nginx com um comando awk
> (https://serverfault.com/questions/638822/nginx-resolver-address-from-etc-resolv-conf)
> ```
> echo resolver $(awk 'BEGIN{ORS=" "} $1=="nameserver" {print $2}' /etc/resolv.conf) ";" > /etc/nginx/resolvers.conf
> ```
> Depois basta incluir com  include resolvers.conf;



Onde que 'search default.svc.cluster.local ...' especifica a lista para lookup de hostnames (domínios locais que podem ser concatenado aos nomes dos serviços.)

E 'nameserver 10.43.0.10' especifica o ip do servidor dns que será capaz de resolver corretamente os nomes.

## Configuração Nginx
(Veja o arquivo nginx-configmap.yaml)

Para a configuração do nginx funcionar é necessário:
1. Especificar um resolver com o ip do servidor dns local (Veja http://nginx.org/en/docs/http/ngx_http_core_module.html#resolver)
```conf
	server {
		resolver 10.43.0.10 valid=10s; # Pode aqui
		...
            location / {
                resolver 10.43.0.10 valid=10s; # E aqui também se quiser
			...
			}
		...
	}
```

2. Realizar o regex com base no nome do domínio (Veja https://stackoverflow.com/questions/9578628/redirecting-a-subdomain-with-a-regular-expression-in-nginx)

Veja abaixo o regex:
`server_name ~^(?<subdomain>.+)\.exemplo\.com\.br$;`

Irá 'dar match' em qualquer domínio '*.exemplo.com.br' e armazenar o que está no '*' na variável $subdomain

1. Concatenar o nome do serviço ao domínio local completo ao realizar o encaminhamento

proxy_pass `http://$subdomain.default.svc.cluster.local:80$request_uri;`

Desta forma o resolver será capaz de encontrar o IP do hostname corretamente.

(Sobre o $request_uri veja: https://stackoverflow.com/questions/48708361/nginx-request-uri-vs-uri)