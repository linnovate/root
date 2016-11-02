FROM node:4

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN npm install -g mean-cli bower node-gyp gulp
COPY . /usr/src/app/
RUN npm install
RUN node tools/scripts/postinstall
RUN bower install --allow-root
RUN touch /root/.mean
ENV PORT 3100
ENV MONGODB_URI mongodb://db/icu
RUN gulp sass
CMD [ "npm", "start" ]
EXPOSE 3100
