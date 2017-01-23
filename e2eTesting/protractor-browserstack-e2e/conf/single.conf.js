exports.config = {
  'specs': ['../specs/single.js'],
  'seleniumAddress': 'http://hub-cloud.browserstack.com/wd/hub',
  'onPrepare': function() {
  browser.driver.manage().window().maximize();
},

  'capabilities': {
    'browserstack.user': process.env.dvoragadasi1 || 'dvoragadasi1',
    'browserstack.key': process.env.jYLyXm4gi81JZNofSq8C || 'jYLyXm4gi81JZNofSq8C',
    'build': 'protractor-browserstack',
    'name': 'single_test',
    'browserName': 'chrome',
    'resolution': '1920x1080',
    'browserstack.debug': 'true',
     'browser_version': '52.0',
     'os': 'Windows',
     'os_version': '10'
  },
  framework: 'jasmine2',
  'jasmineNodeOpts': {
    'showColors': true,
    // 'defaultTimeoutInterval': 50000
  },
};