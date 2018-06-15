FROM node:8.4

COPY . /opt/gizi

WORKDIR /opt/gizi

RUN npm install

VOLUME /opt/gizi

ENTRYPOINT npm start