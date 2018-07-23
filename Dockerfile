FROM node:8-alpine

RUN apk update \
  && apk add git \
  && npm install -g npm@latest

USER node:node

COPY --chown=node:node . /usr/src/app
WORKDIR /usr/src/app

RUN npm install \
  && npm run production \
  && npm prune --production

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server"]
