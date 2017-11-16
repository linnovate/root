FROM node:4

RUN npm install -g bower gulp
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