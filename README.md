# WebAuthn minimal with WSO2 as relying party (authenticator)

## Requirements

- [Docker](https://docs.docker.com/get-docker/) v24
- [Docker-compose](https://docs.docker.com/compose/install/) v1.26
- [Git](https://git-scm.com/downloads) v1.8
- [Postman](https://www.postman.com/downloads/) v10.16 (or curl)
- Chrome browser v115.0.5790

Note: these versions are not mandatory, and it should work with others, although I've tested the code with such versions

## Components

- wso2-server - a WSO2 server configured to work with FIDO2 authenticator
- web - contains the frontend with capabilities for security key devices registration and login
- login-service - backend to perform login using the authorization code flow with WSO2 behind the firewall

## Build

```shell
docker-compose build
```

## Run

```shell
docker-compose up -d
```

## Logs

```shell
docker-compose logs -f
```