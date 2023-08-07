# Build fido2 authenticator
FROM maven:3.6-jdk-8 as build-fido2
ARG FIDO2_COMPONENT_VERSION=5.2.8
COPY hotfix-5-2-8-webauthn-2-20210408.patch .
RUN git clone --branch v5.2.8 --depth 1 https://github.com/wso2-extensions/identity-local-auth-fido.git
RUN cd identity-local-auth-fido && \
    git apply --verbose ../hotfix-5-2-8-webauthn-2-20210408.patch && \
    mvn clean install && \
    mv -v components/org.wso2.carbon.identity.application.authenticator.fido2/target/org.wso2.carbon.identity.application.authenticator.fido2-$FIDO2_COMPONENT_VERSION.jar /

# WSO2 Identity Server
FROM wso2/wso2is:5.11.0
ARG WSO2_IS_VERSION=5.11.0
ARG FIDO2_COMPONENT_VERSION=5.2.8
ARG WSO2_REPO_PATH=/home/wso2carbon/wso2is-$WSO2_IS_VERSION/repository
ARG WSO2_WEBAPPS_PATH=$WSO2_REPO_PATH/deployment/server/webapps

RUN rm -v $WSO2_REPO_PATH/components/plugins/org.wso2.carbon.identity.application.authenticator.fido2_$FIDO2_COMPONENT_VERSION.jar
COPY --from=build-fido2 --chown=wso2carbon:wso2 /org.wso2.carbon.identity.application.authenticator.fido2-$FIDO2_COMPONENT_VERSION.jar \
    $WSO2_REPO_PATH/components/plugins/org.wso2.carbon.identity.application.authenticator.fido2_$FIDO2_COMPONENT_VERSION.jar
COPY --chown=wso2carbon:wso2  log4j2.properties $WSO2_REPO_PATH/conf/log4j2.properties
COPY --chown=wso2carbon:wso2  deployment.toml $WSO2_REPO_PATH/conf/deployment.toml