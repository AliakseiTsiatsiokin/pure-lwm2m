FROM node:6.11

RUN mkdir -p /usr/local/pure-lwm2m
WORKDIR /usr/local/pure-lwm2m
COPY package.json /usr/local/pure-lwm2m/
COPY index.js /usr/local/pure-lwm2m/
COPY config.json /usr/local/pure-lwm2m/
COPY sensorSchema.json /usr/local/pure-lwm2m/
COPY lwm2m/ /usr/local/pure-lwm2m/lwm2m/
RUN npm install

CMD npm start