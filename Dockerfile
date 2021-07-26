FROM node:10-alpine

RUN apk update \
  && apk add git

RUN npm install -g bower gulp
USER node:node

COPY --chown=node:node . /usr/src/app

WORKDIR /usr/src/app

ARG ROOT_LANG
RUN npm install \
  && npm run production \
  && npm prune --production

EXPOSE 3000

CMD ["node", "server"]
