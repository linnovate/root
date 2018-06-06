FROM node:8

WORKDIR /usr/src/app
COPY . /usr/src/app

# Install latest version of npm to solve package-lock.json problems
RUN npm install -g npm@latest

RUN chown -R node:node /usr/src/app
USER node:node

RUN npm install
RUN npm run build

ENV PORT 3000

CMD ["node", "server"]
