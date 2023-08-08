# Curl Requests

## FIDO2 WSO2 Registration

### Values

- Username: `user1`
- Password: `123456`
- WSO2 FQDN: `https://localhost:9443`
- app ID: `http://localhost:8080`

Start usernameless registration:

```shell
curl -k --location 'https://localhost:9443/t/carbon.super/api/users/v2/me/webauthn/start-usernameless-registration' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--header 'Authorization: Basic dXNlcjE6MTIzNDU2' \
--data-urlencode 'appId=http://localhost:8080'
```

Finish usernameless registration (replace sample data object with yours):

```shell
curl -i -k --location 'https://localhost:9443/t/carbon.super/api/users/v2/me/webauthn/finish-registration' \
--header 'Content-Type: application/json' \
--header 'Authorization: Basic dXNlcjE6MTIzNDU2' \
--data '{
    "requestId": "eCzLJiDUwDQQXF2lj4QdicCSYbV1L8cp0vmZRIs-k64",
    "credential": {
        "id": "<b64 url data>",
        "response": {
            "attestationObject": "<b64 url data>",
            "clientDataJSON": "eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXR"
        },
        "clientExtensionResults": {
            "credProtect": 3
        },
        "type": "public-key"
    }
}'
```

**Note:** this is to register a security key device not a user.