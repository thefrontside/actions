FROM node:12-alpine

RUN apk add --no-cache \
  git \
  bash \ 
  git-subtree \
  jq \ 
  zsh \
  && chsh -s /bin/zsh || true

COPY entrypoint.sh /entrypoint.sh

ENV SHELL /usr/bin/zsh

ENTRYPOINT ["zsh", "/entrypoint.sh"]


