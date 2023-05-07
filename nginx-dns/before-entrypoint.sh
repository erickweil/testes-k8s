#!/bin/sh
set -e

# https://stackoverflow.com/questions/31324981/how-to-access-host-port-from-docker-container

# para ter o valor correto do IP
export DOCKER_HOST_IP=$(ip route show | awk '/default/ {print $3}')

# para ter o valor correto do resolver dns
export RESOLVER_IP=$(awk 'BEGIN{ORS=" "} $1=="nameserver" {print $2}' /etc/resolv.conf)

./docker-entrypoint.sh "$@"