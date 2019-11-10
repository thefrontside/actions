FROM node:12-alpine

RUN apk add --no-cache git bash git-subtree jq

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["bash", "/entrypoint.sh"]
