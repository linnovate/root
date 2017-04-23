exports.config = {
  specs: [__dirname + '/test.js'],
  onPrepare: function() {
    browser.driver.manage().window().maximize();
  },
  framework: 'jasmine2',
  jasmineNodeOpts: {
    showColors: true
  },
};
