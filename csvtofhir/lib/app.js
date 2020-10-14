'use strict'

const express = require('express');
const URI = require('urijs');
const isJSON = require('is-json');
const path = require('path');
const _ = require('underscore');
const {createLogger,format,transports} = require('winston');
const { combine, timestamp, label, printf } = format;
const customLibrairy=require('./lib.js');
const myFormat = printf(({ level, message, label, timestamp,operationType,action,result }) => {
    return `${timestamp},${level},${label},${operationType},${action},${result},${message}`;
  });
// Config

const mappingConfig = require('../config/resources-mapping')
var port = mappingConfig.app.port;
var logger=null;
var indexName;
var appOperationType="import";
var logFileName;
var filePath;
var typeOperation ={
    startTheService:"Start",
    stopTheService:"Stop",
    getData:"Get",
    postData:"Post",
    putData:"Put",
    deleteData:"Delete",
    normalProcess:"Process"
};
var typeResult={
    success:"Success",
    failed:"Failed",
    iniate:"Initiate",
    ongoing:"ongoing"
};
var levelType={
    info:"info",
    error:"error",
    warning:"warn"
};
//----------------------------Define logger information -------------------------------------/


/**
 * setupApp - configures the http server for this mediator
 *
 * @return {express.App}  the configured http server
 */
function errorHandler(err, req, res, next) {
    if (res.headersSent) {
      return next(err);
    }
    res.status(500);
    res.render('error', { error: err });
}

/************************* Main app entry point****************************************** */
function setupApp () {
    const app = express()
    app.use(errorHandler);
    app.get("/test",(req, res)=>{
        //res.send("Is is working!");
        var stooges = [{name: 'moe', age: 40}, {name: 'larry', age: 50}, {name: 'curly', age: 60}];
        let sorted=_.sortBy(stooges, 'age');
        res.send(sorted);
    });//end get(/error)
    app.get("/practitioner",(req, res)=>{
      logger.log({level:levelType.info,operationType:typeOperation.normalProcess,action:"/practitioner",result:typeResult.iniate,
      message:`Start the import CSV file content`});
      let filePath=mappingConfig.app.dataFilePath;
      customLibrairy.readCSVData(filePath,function(recordPractitioners){
        //console.log(patientData);
        logger.log({level:levelType.info,operationType:typeOperation.getData,action:"readCSVData",
        result:typeResult.success,message:`Return ${recordPractitioners.length} practitioner`});
        let listExtractedPractitioner=[];
        listExtractedPractitioner=customLibrairy.buildPractitioner(recordPractitioners);
        res.send(listExtractedPractitioner);
        
      });
    });//end 
    app.get("/practitionerrole",(req, res)=>{
      logger.log({level:levelType.info,operationType:typeOperation.normalProcess,action:"/practitioner",result:typeResult.iniate,
      message:`Start the import CSV file content`});
      let filePath=mappingConfig.app.dataFilePath;
      customLibrairy.readCSVData(filePath,function(recordPractitioners){
        //console.log(patientData);
        logger.log({level:levelType.info,operationType:typeOperation.getData,action:"readCSVData",
        result:typeResult.success,message:`Return ${recordPractitioners.length} practitioner`});
        let listExtractedPractitionerRole=[];
        listExtractedPractitionerRole=customLibrairy.buildPractitionerRole(recordPractitioners);
        res.send(listExtractedPractitionerRole);
        
      });
    });//end
    app.get("/location",(req, res)=>{
      logger.log({level:levelType.info,operationType:typeOperation.normalProcess,action:"/location",result:typeResult.iniate,
      message:`Start the import CSV file content`});
      let filePath=mappingConfig.app.dataFilePath;
      customLibrairy.readCSVData(filePath,function(recordPractitioners){
        //console.log(patientData);
        logger.log({level:levelType.info,operationType:typeOperation.getData,action:"readCSVData",
        result:typeResult.success,message:`Return ${recordPractitioners.length} practitioner`});
        let listExtractedLocation=[];
        listExtractedLocation=customLibrairy.buildLocation(recordPractitioners);
        res.send(listExtractedLocation);
        
      });
    });//end
    app.get("/job",(req, res)=>{
      logger.log({level:levelType.info,operationType:typeOperation.normalProcess,action:"/Job-ValueSet",result:typeResult.iniate,
      message:`Start the import CSV file content`});
      let filePath=mappingConfig.app.dataFilePath;
      customLibrairy.readCSVData(filePath,function(recordPractitioners){
        //console.log(patientData);
        logger.log({level:levelType.info,operationType:typeOperation.getData,action:"readCSVData",
        result:typeResult.success,message:`Return ${recordPractitioners.length} practitioner`});
        let listExtractedJob=[];
        listExtractedJob=customLibrairy.buildJob(recordPractitioners);
        res.send(listExtractedJob);
        
      });
    });//end
    
    return app
}
function chunckTEI(array,size){
  const chunked_arr = [];
  let copied = [...array]; // ES6 destructuring
  const numOfChild = Math.ceil(copied.length / size); // Round up to the nearest integer
  for (let i = 0; i < numOfChild; i++) {
    var newTEIcollection={
      trackedEntityInstances:copied.splice(0, size)
    };
    //chunked_arr.push(copied.splice(0, size));
    chunked_arr.push(newTEIcollection);
  }
  return chunked_arr;

}
function chunckEvents(array,size){
  const chunked_arr = [];
  let copied = [...array]; // ES6 destructuring
  const numOfChild = Math.ceil(copied.length / size); // Round up to the nearest integer
  for (let i = 0; i < numOfChild; i++) {
    var newEventcollection={
      events:copied.splice(0, size)
    };
    //chunked_arr.push(copied.splice(0, size));
    chunked_arr.push(newEventcollection);
  }
  return chunked_arr;

}


/*****************************************Start the app********************* */
function start (callback) {
    //filePath=mappingConfig.app.appDirectory;
    
    if(appOperationType=="import")
    {
        indexName="import";
    }
    indexName+=`_${new Date().toISOString().split("T")[0]}.log`;
    logFileName=path.join(__dirname,`/logs/${indexName}.log`);
    logger = createLogger({
        format: combine(
          label({ label: "htaUtilities" }),
          timestamp(),
          myFormat
        ),
        transports: [new transports.Console(),
            new transports.File({ filename: logFileName })
        ]
      });
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
    let app = setupApp()
    logger.log({level:levelType.info,operationType:typeOperation.normalProcess,action:"App start up",
        result:typeResult.success,message:`App start up successfuly`});
    const server = app.listen(port, () => callback(server))
}
exports.start = start
if (!module.parent) {
    // if this script is run directly, start the server
    start(() => console.log(`Listening on ${port}...`))
  }

  process.on('uncaughtException', err => {
    console.log(err);
    logger.log({level:levelType.error,operationType:typeOperation.stopTheService,action:`arret anormal du mediateur sur l'action `,result:typeResult.failed,
    message:`Stop the mediator on ${port}...`})
    process.exit(1)
    //globalRes.redirect("/error");
  });
  process.on('SIGTERM', signal => {
    logger.log({level:levelType.info,operationType:typeOperation.stopTheService,action:"Arret du mediateur",result:typeResult.success,
    message:`Arret normal du mediateur`})
    process.exit(0)
  });
  process.on('SIGINT', signal => {
  logger.log({level:levelType.error,operationType:typeOperation.stopTheService,action:"Arret brusque du mediateur",result:typeResult.success,
  message:`Arret anormal du mediateur`})
  process.exit(0)
  })
