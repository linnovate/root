FROM node:4

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app/
RUN npm install -g bower gulp
RUN npm install
RUN echo '{}' > /root/.mean
RUN node tools/scripts/postinstall
RUN bower install --allow-root
RUN cd packages/custom/icu && bower install --allow-root
RUN gulp sass
ENV PORT 3100
ENV MONGODB_URI mongodb://db/icu
ENV ELASTICSEARCH_IP 172.17.0.3
CMD ["npm", "start"]
EXPOSE 3100
#test
