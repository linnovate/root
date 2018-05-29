FROM node:8
#test1
RUN npm install -g npm@latest
RUN npm install -g bower gulp
RUN npm install -g nodemon@1.11.0
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app/
RUN chown -R node:node /usr/src/app
USER node:node
RUN echo '{}' > $HOME/.mean
RUN npm install
RUN bower install
ENV PORT 3100
ENV MONGODB_URI mongodb://root-db/icu
ENV ELASTICSEARCH_IP root-elastic
CMD ["npm", "start"]
EXPOSE 3100
#test
