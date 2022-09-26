FROM golang:alpine as source

RUN apk update && apk add alpine-sdk

WORKDIR /usr/local/go/src/

COPY ./main ./main

RUN cd main && go build -o server

FROM alpine:latest

WORKDIR /app

COPY --from=source /usr/local/go/src/main/server /app/server

COPY resource/ /app/

RUN addgroup -S user && adduser -S user -G user && \
    chown  -R user:user /app/

USER user

ENTRYPOINT  ["/app/server"]