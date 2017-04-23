FROM node:4

RUN mkdir -p /usr/src/app
RUN mkdir -p /home/user
WORKDIR /usr/src/app
COPY . /usr/src/app/
RUN groupadd -r user && useradd -r -g user user
RUN chown -R user:user /usr/src/app
RUN chown -R user:user /home/user
RUN npm install -g bower gulp
USER user
RUN touch /home/user/.mean
RUN npm install
RUN node tools/scripts/postinstall
RUN bower install
RUN gulp sass
ENV PORT 3100
ENV MONGODB_URI mongodb://db/icu
CMD ["npm", "start"]
EXPOSE 3100
#test
