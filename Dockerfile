FROM node:8-alpine

RUN apk update \
  && apk add git \
  && npm install -g npm@latest
COPY . /usr/src/app
WORKDIR /usr/src/app
USER root
RUN chown -R node .
USER node:node

RUN npm install \
  && npm run production \
  && npm prune --production

EXPOSE 3000

CMD ["node", "server"]
