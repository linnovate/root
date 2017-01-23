exports.config = {
  'specs': [ '../specs/single.js' ],
  'seleniumAddress': 'http://hub-cloud.browserstack.com/wd/hub',

  'commonCapabilities': {
    'browserstack.user': process.env.dvoragadasi1 || 'dvoragadasi1',
    'browserstack.key': process.env.jYLyXm4gi81JZNofSq8C || 'jYLyXm4gi81JZNofSq8C',
    'build': 'protractor-browserstack',
    'name': 'parallel_test',
    'browserstack.debug': 'true',
    'browserName': 'Chrome'
  },

  'multiCapabilities': [{
    'browserName': 'Chrome'
  },{
    'browserName': 'Safari'
  },{
    'browserName': 'Firefox'
  },{
    'browserName': 'IE'
  }]
};

// Code to support common capabilities
exports.config.multiCapabilities.forEach(function(caps){
  for(var i in exports.config.commonCapabilities) caps[i] = caps[i] || exports.config.commonCapabilities[i];
});
