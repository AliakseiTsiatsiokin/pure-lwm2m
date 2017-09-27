FROM node:6.11

RUN mkdir -p /usr/local/pureLwm2m
WORKDIR /usr/local/pureLwm2m
COPY package.json /usr/local/pureLwm2m/
COPY index.js /usr/local/pureLwm2m/
COPY config.json /usr/local/pureLwm2m/
COPY sensorSchema.json /usr/local/pureLwm2m/
COPY lwm2m/ /usr/local/pureLwm2m/lwm2m/
RUN npm install

CMD npm start