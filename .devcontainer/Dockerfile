ARG VARIANT="22-bookworm"
FROM mcr.microsoft.com/devcontainers/typescript-node:1-${VARIANT}

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends npm

RUN sudo apt-get install gnupg2 -y

# [Optional] Uncomment if you want to install an additional version
#  of node using nvm
ARG EXTRA_NODE_VERSION=18
RUN su node -c "source /usr/local/share/nvm/nvm.sh \
    && nvm install ${EXTRA_NODE_VERSION}"

RUN npm install -g pnpm@latest-10

# COPY ./customScript.sh /tmp/scripts/customScript.sh
# RUN apt-get update && bash /tmp/scripts/customScript.sh
