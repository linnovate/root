FROM node:10-alpine

RUN apk update \
  && apk add git

USER node:node

COPY --chown=node:node . /usr/src/app

WORKDIR /usr/src/app

RUN npm install \
  && npm run production \
  && npm prune --production

EXPOSE 3000

CMD ["node", "server"]
