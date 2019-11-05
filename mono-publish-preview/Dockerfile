FROM node:12-alpine

RUN apk add --no-cache git bash git-subtree jq zsh

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["zsh", "/entrypoint.sh"]


