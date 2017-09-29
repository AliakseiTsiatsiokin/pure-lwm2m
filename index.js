'use strict';

const RTM = require("satori-rtm-sdk");
const config = require('./config.json');
const publisher = config.publisher;

const pubRoleSecretProvider = RTM.roleSecretAuthProvider(publisher.role, publisher.roleSecret);

/* Publisher setup */
const rtmPublisher = new RTM(publisher.endpoint, publisher.appkey, {
  authProvider: pubRoleSecretProvider
});

rtmPublisher.on("enter-connected", function () {
  console.log("Publisher:Connected to Satori RTM!");
});
rtmPublisher.on("leave-connected", function () {
  console.log("Publisher:Disconnected from Satori RTM");
});
rtmPublisher.start();

/* lwm2m server setup */
const message = {};
const lwm2mServer = require('./lwm2m');
const content = require('./lwm2m/lib/contentFormats');
const Schema = require('./lwm2m').Schema;
const server = lwm2mServer.createServer();
const pathToNames = config.pathToNames;
const schemaSensor = Schema(require('./sensorSchema.json'));

/* data transfering functions */
function publishData(){
  rtmPublisher.publish(publisher.name, message, function(pdu) {
    if (pdu.action.endsWith("/ok")) {
      console.log("\n\n\n\n\nDevice is published: " + JSON.stringify(message, null ,4));
    } else {
      console.log("Publish request failed: " + pdu.body.error + " - " + pdu.body.reason);
    }
  });
}

function readData(params, path, readOptions, finish){
  server
    .read(
      params.ep, path, readOptions)
    .then(function(payload) {
      message[pathToNames[path.split('/')[0]]] = payload;
      finish && finish();
    })
    .catch(function(err) {
      console.log(err);
    });
}

function commonRequestHandler(params){
  setImmediate(function() {
    readData(params, '3/0',{
      format: content.json
    });
    readData(params, '3303/0',{
      schema: schemaSensor,
      format: content.json
    });
    readData(params, '3304/0',{
      schema: schemaSensor,
      format: content.json
    },publishData);
  });
}

server.on('register', function(params, accept) {
  commonRequestHandler(params);
  accept();
});
server.on('update', function(params) {
  commonRequestHandler(params);
});

server.listen(5683);