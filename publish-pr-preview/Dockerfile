FROM node:12-alpine

RUN apk add --no-cache git bash git-subtree

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["sh", "/entrypoint.sh"]