FROM node:12-alpine

RUN apk add --no-cache git bash git-subtree jq 
RUN ["apt-get", "update"]
RUN ["apt-get", "install", "-y", "zsh"]
RUN wget https://github.com/robbyrussell/oh-my-zsh/raw/master/tools/install.sh -O - | zsh || true

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["zsh", "/entrypoint.sh"]
