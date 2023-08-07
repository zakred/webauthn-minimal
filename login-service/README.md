# Login Service

## Config

| ENV                    | Description                      | Default                        |
|------------------------|----------------------------------|--------------------------------|
| SERVER_PORT            | Port of the login server         | 3000                           |
| CONTEXT_PATH           | Context path of the login server | /                              |
| WSO2_FQDN              | FQDN of the WSO2 server          | https://localhost:9443         |
| CLIENT_ID              | Service provider client id       | _2dFjRlLCZPPbV4EnbL02AXIy6Ya   |
| CLIENT_SECRET          | Service provider client secret   | ywbDEJDPuQFfhtocdArLIkTex18a   |
| REDIRECT_CALLBACK_FQDN | URL for the callback server      | http://localhost:3000/callback |

## Generate documentation

```shell
yarn doc
```

## Install dependencies

```shell
yarn install
```

## Run

```shell
yarn start
```
