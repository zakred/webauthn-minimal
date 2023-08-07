#!/bin/bash

if [ -z "LOGIN_SERVER_FQDN" ]; then
    echo "environment variable required: LOGIN_SERVER_FQDN"
    exit 1
fi

sed -i "s|@@LOGIN_SERVER_FQDN@@|$LOGIN_SERVER_FQDN|g" $WEB_HOME/login.js
exec httpd -DFOREGROUND