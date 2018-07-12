FROM node:8-alpine

WORKDIR /usr/src/app
RUN chown node:node /usr/src/app
COPY --chown=node:node . /usr/src/app

# Install latest version of npm to solve package-lock.json problems
RUN npm install -g npm@latest

# Install git - required by bower
RUN apk update
RUN apk add git

USER node:node

RUN npm install
RUN npm run production
RUN npm prune --production

ENV PORT 3000
ENV MONGODB_URI mongodb://root-db/icu
ENV ELASTICSEARCH_IP root-elastic

CMD ["node", "server"]
