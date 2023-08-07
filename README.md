# WebAuthn minimal with WSO2 as relying party (authenticator)

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