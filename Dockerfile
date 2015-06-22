FROM iojs:2

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN npm install -g node-gyp
RUN npm install -g mean-cli bower node-gyp
COPY . /usr/src/app/
RUN npm install
RUN bower install --allow-root
RUN mean-postinstall
RUN touch /root/.mean
ENV PORT 3100  
ENV MONGODB_URI mongodb://db/icu
CMD [ "npm", "start" ]
EXPOSE 3100
