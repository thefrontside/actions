FROM node:12-alpine

RUN apk add --no-cache \
  git \
  bash \ 
  git-subtree \
  jq \ 
  zsh

RUN sed -i -e "s/bin\/ash/bin\/zsh/" /etc/passwd

COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

ENV SHELL /bin/zsh

ENTRYPOINT ["/entrypoint.sh"]


