const request = require('request');
const async = require('async');
const URI = require('urijs');
const isJSON = require('is-json');


const config = {
  remote: {
    fhir: {
      baseURL: 'http://localhost:8000',
      username: '',
      password: '',
      /*
      baseURL: 'http://192.168.1.100:8083/hapi/fhir',
      username: 'hapi',
      password: 'hapi',*/
    },
  },
  local: {
    fhir: {
      baseURL: 'http://192.168.1.100:8083/hapi/fhir',
      username: '',
      password: '',
    },
  },
};

/*
let resources = [
  'Basic',
  'ValueSet',
  'CodeSystem',
  'Practitioner',
  'PractitionerRole',
  'StructureDefinition',
  'Location',
  'OperationDefinition',
  'Person',
  'Patient',
  'Organization',
  'CompartmentDefinition',
  'SearchParameter',
];
*/
let resources = [
  'ValueSet'
];

async.eachSeries(resources, (resource, nxtResource) => {
  let bundle = {};
  bundle.entry = [];
  bundle.type = 'batch';
  bundle.resourceType = 'Bundle';
  getResource(resource, (err, resourceData) => {
  //getResourceFromiHRIS(resource, (err, resourceData) => {
    console.log(`Processing ${resourceData.entry.length} of resource ${resource}`)
    for (let data of resourceData.entry) {
      if (!data.resource || !data.resource.resourceType) {
        continue;
      }
      
       bundle.entry.push({
        resource: data.resource,
        request: {
          method: 'PUT',
          url: data.resource.resourceType + '/' + data.resource.id,
        },
      }); 
      /*
      bundle.entry.push({
        resource: data.resource,
        request: {
          method: 'DELETE',
          url: data.resource.resourceType + '/' + data.resource.id,
        },
      });*/
      
      if (bundle.entry.length === 250) {
        let tmpBundle = {
          ...bundle,
        };
        bundle.entry = [];
        saveResource(tmpBundle, () => {});
      }
    }
    if (bundle.entry.length > 0) {
      saveResource(bundle, () => {});
    }
    nxtResource();
  });
});

function getResource(resource, callback) {
  const resourceData = {};
  resourceData.entry = [];
  let url = URI(config.remote.fhir.baseURL).segment(resource);
  /*---------Uncommented the _count params is using HAPI -------*/
  //url.addQuery('_count', 500);
  url = url.toString();

console.log(url)
  console.info(
    `Getting data for resource ${resource} from server ${config.remote.fhir.baseURL}`
  );
  async.whilst(
    callback => {
      return callback(null, url !== false);
    },
    callback => {
      const options = {
        url,
        withCredentials: true,
        auth: {
          username: config.remote.fhir.username,
          password: config.remote.fhir.password,
        },
      };
      request.get(options, (err, res, body) => {
        url = false;
        if (err) {
          console.error(err);
        }
        if (!isJSON(body)) {
          console.error(
            'Non JSON has been returned while getting data for resource ' +
            resource
          );
          return callback(true, false);
        }
        if (res.statusCode && (res.statusCode < 200 || res.statusCode > 399)) {
          return callback(true, false);
        }
        body = JSON.parse(body);
        if (!body.entry) {
          console.error('Invalid resource data returned by FHIR server');
          return callback(true, false);
        }
        if (body.total === 0 && body.entry && body.entry.length > 0) {
          console.error('Non resource data returned for resource ' + resource);
          return callback(true, false);
        }
        if (body.entry && body.entry.length > 0) {
          resourceData.entry = resourceData.entry.concat(body.entry);
        }
        const next =
          body.link && body.link.find(link => link.relation === 'next');
          var rebuildUrl="";
        if (next) {
          //url = next.url;
          var urlParts=[];
          urlParts=next.url.split("?");
          rebuildUrl=`${config.remote.fhir.baseURL}?${urlParts[1]}`;
          url=rebuildUrl;
          console.log(`Has next: ${rebuildUrl}`);
        }
        return callback(null, url);
      });
    },
    err => {
      console.info(
        `Done Getting data for resource ${resource} from server ${config.remote.fhir.baseURL}`
      );
      return callback(err, resourceData);
    }
  );
}
function getResourceFromiHRIS(resource, callback) {
  const resourceData = {};
  resourceData.entry = [];
  let url = URI(config.remote.fhir.baseURL).segment(resource).segment('_history');
  url.addQuery('_format','json');
  //url.addQuery('_count', 500);
  url = url.toString();
console.log(url)
  console.info(
    `Getting data for resource ${resource} from server ${config.remote.fhir.baseURL}`
  );
  async.whilst(
    callback => {
      return callback(null, url !== false);
    },
    callback => {
      const options = {
        url,
        withCredentials: true,
        auth: {
          username: config.remote.fhir.username,
          password: config.remote.fhir.password,
        },
      };
      request.get(options, (err, res, body) => {
        url = false;
        if (err) {
          console.error(err);
        }
        if (!isJSON(body)) {
          console.error(
            'Non JSON has been returned while getting data for resource ' +
            resource
          );
          return callback(true, false);
        }
        if (res.statusCode && (res.statusCode < 200 || res.statusCode > 399)) {
          return callback(true, false);
        }
        body = JSON.parse(body);
        if (!body.entry) {
          console.error('Invalid resource data returned by FHIR server');
          return callback(true, false);
        }
        if (body.total === 0 && body.entry && body.entry.length > 0) {
          console.error('Non resource data returned for resource ' + resource);
          return callback(true, false);
        }
        if (body.entry && body.entry.length > 0) {
          resourceData.entry = resourceData.entry.concat(body.entry);
        }
        const next =
          body.link && body.link.find(link => link.relation === 'next');
        if (next) {
          url = next.url;
        }
        return callback(null, url);
      });
    },
    err => {
      console.info(
        `Done Getting data for resource ${resource} from server ${config.remote.fhir.baseURL}`
      );
      return callback(err, resourceData);
    }
  );
}

function saveResource(bundle, callback) {
  console.info('Saving resource data');
  const url = URI(config.local.fhir.baseURL).toString();
  const options = {
    url,
    withCredentials: true,
    auth: {
      username: config.local.fhir.username,
      password: config.local.fhir.password,
    },
    headers: {
      'Content-Type': 'application/json',
    },
    json: bundle,
  };
  /* console.log(JSON.stringify( bundle));
  return callback("Gerard Error"); */
  request.post(options, (err, res, body) => {
    if (err) {
      console.error(err);
      return callback(err);
    }
    if (res.statusCode && (res.statusCode < 200 || res.statusCode > 399)) {
      return callback(true);
    }
    console.info('Resource(s) data saved successfully');
    callback(err, body);
  });
}
