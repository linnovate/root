// Change directory, to let mean load the right configurations
const path = require('path');
const rootDirectory = path.resolve(__dirname, '..');
process.chdir(rootDirectory);

// `elasticsearch` package is not installed on the project root directory
// that's why we have to supply the full path to the dependency
const elasticsearch = require('../packages/custom/elasticsearch/node_modules/elasticsearch');
const { elasticsearch: esConfig } = require('meanio').loadConfig();
const mappings = require('./mappings');

var hosts = [];
for(let i in esConfig.hosts) {
  hosts.push(esConfig.hosts[i]);
}

const client = new elasticsearch.Client({
  hosts: hosts
});

// For each index in the mappings object, create the index and set mappings + analyzer
var promises = [];
for(let i in mappings) {
  let p = client.indices.create({
    index: i,
    body: {
      settings: {
        analysis: {
          analyzer: {
            autocomplete: { 
              type: 'custom',
              tokenizer: 'standard',
              filter: [
                'lowercase'
              ]
            }
          }
        }
      },
      mappings: mappings[i].mappings
    }
  });
  promises.push(p)
}

Promise.all(promises).then(results => {
  console.log(results)
}).catch(e => {
  console.log(e)
})
