# Alpine is chosen for its small footprint
# compared to Ubuntu
FROM golang:1.16-alpine

WORKDIR /app

# Download necessary Go modules

COPY . ./
RUN go mod download
RUN go mod download github.com/ugorji/go

RUN go build main.go

EXPOSE 9090

CMD [ "./main"]