FROM ubuntu:24.04

MAINTAINER SDF Ops Team <ops@stellar.org>

ADD . /app/src
WORKDIR /app/src

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install --no-install-recommends -y \
    gpg curl ca-certificates git apt-transport-https && \
    curl -sSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key|gpg --dearmor >/etc/apt/trusted.gpg.d/nodesource-key.gpg && \
    echo "deb https://deb.nodesource.com/node_22.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list && \
    apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs && \
    npm ci --legacy-peer-deps && npm run build

ENV PORT=80 UPDATE_DATA=false
EXPOSE 80

RUN node_modules/typescript/bin/tsc

# Copy common directory to dist for runtime access
RUN cp -r common dist/

# Change working directory to dist for runtime
WORKDIR /app/src/dist

ENTRYPOINT ["/usr/bin/node"]
CMD ["./backend/app.js"]
