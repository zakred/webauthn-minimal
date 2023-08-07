FROM httpd:2-alpine
COPY . /usr/local/apache2/htdocs/
RUN mv -v /usr/local/apache2/htdocs/entrypoint.sh /entrypoint.sh && \
    chmod +x -v /entrypoint.sh

ENV WEB_HOME="/usr/local/apache2/htdocs"
ENTRYPOINT ["sh", "-c", "source /entrypoint.sh"]