FROM node:12-alpine

RUN apk add --no-cache bash

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["sh", "/entrypoint.sh"]