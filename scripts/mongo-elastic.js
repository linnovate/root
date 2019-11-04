const path = require('path');
const mongodb = require('mongodb');
const elasticsearch = require('../packages/custom/elasticsearch/node_modules/elasticsearch');
const ProgressBar = require('progress');


// Following envs can be customized
const MONGO_URL = process.env.MONGODB_URI || 'mongodb://root:password123@localhost:27017/icu-dev?authSource=admin';
const ELASTICSEARCH_URLS = process.env.ELASTICSEARCH_IP && process.env.ELASTICSEARCH_IP.split(/\s+/) || ['http://localhost:9200'];

// limit number of docs per collection which will be imported
const limit = process.env.LIMIT || undefined;

// List of MongoDB collections and their corresponding `index/type` in elasticsearch
const collections = {
  tasks: 'task',
  projects: 'project',
  discussions: 'discussion',
  folders: 'folder',
  documents: 'officedocument',
  attachments: 'attachment',
  updates: 'update'
};



const esClient = new elasticsearch.Client({
	host: ELASTICSEARCH_URLS
});


mongodb.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async client => {
  let db = client.db();

  try {

    for(let key in collections) {
      let coll = db.collection(key);

      let count = await coll.countDocuments({}, { limit })
      let bar = new ProgressBar(key + ' :bar', { total: count });

      let cursor = coll.find({}, { limit });

      while(await cursor.hasNext()) {
        var doc = await cursor.next();
        let docId = doc._id.toJSON();
        delete doc._id;

        doc = serializeDoc(doc);

        let response = await esClient.index({
          index: collections[key],
          type: collections[key],
          id: docId,
          body: doc
        });

        bar.tick();
      }

    }

  } catch(e) {
    console.log(e);
    console.log(doc)
  }

  console.log('Finished successfully')
  client.close()

})


function serializeDoc(doc) {
  ['current', 'prev'].forEach(field => {
    if(Array.isArray(doc[field])) {
      doc[field] = doc[field].map(w => {
        return ensureUserAsID(w)
      })
    } else if(typeof doc[field] === 'object') {
      doc[field] = ensureUserAsID(doc[field]);
    }
  })
  return doc;
}

function ensureUserAsID(user) {
  if(user && typeof user === 'object') {
    return user._id;
  } else {
    return user;
  }
}
