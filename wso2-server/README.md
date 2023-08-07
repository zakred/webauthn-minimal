# WSO2 identity server

## Files

- deployment.toml - wso2 configuration
- fido2-wso2-service-provider.xml - service provider configured with fido authenticator and OAuth2 inbound
- hotfix-5-2-8-webauthn-2-20210408.patch - fixes an issue in the wso2 component fido authenticator when providing extensions from the security device response [see more details here](https://github.com/Yubico/java-webauthn-server/issues/92#issuecomment-714602489), patch to wso2 component [fido2 authenticator v5.2.8](https://github.com/wso2-extensions/identity-local-auth-fido/tree/v5.2.8) compatible with docker image [wso2-is v5.11](https://hub.docker.com/r/wso2/wso2is)
- log4j2.properties - this is the default file that comes from the wso2:5.11 image, modified to enable DEBUG mode in most relevant modules making logs more verbose