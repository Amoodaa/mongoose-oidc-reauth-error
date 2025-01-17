FROM mongodb/mongodb-enterprise-server:latest
USER root
RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl jq netcat
ARG TARGETARCH
ARG NODE_VERSION=20.10.0
# change arch as needed
# ARG NODE_ARCH=linux-x64 for docker on x64 systems
# ARG NODE_ARCH=arm64 for docker on macos/arm systems
ARG NODE_PACKAGE=node-v$NODE_VERSION-$NODE_ARCH
ARG NODE_HOME=/opt/$NODE_PACKAGE
ENV NODE_PATH $NODE_HOME/lib/node_modules
ENV PATH $NODE_HOME/bin:$PATH
RUN curl https://nodejs.org/dist/v$NODE_VERSION/$NODE_PACKAGE.tar.gz | tar -xzC /opt/
RUN mkdir -p /tmp/mock-provider && cd /tmp/mock-provider
COPY start-server.sh /start-server.sh
COPY mongodb-js-oidc-mock-provider.js /tmp/mock-provider/mongodb-js-oidc-mock-provider.js
COPY oidc-mock-provider.js /tmp/mock-provider/oidc-mock-provider.js
COPY proxy.js /tmp/mock-provider/proxy.js
ENTRYPOINT ["/start-server.sh"]
