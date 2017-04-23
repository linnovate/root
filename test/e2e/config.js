exports.config = {
  specs: [__dirname + '/test.js'],
  onPrepare: function() {
    browser.driver.manage().window().maximize();
    global.EC = protractor.ExpectedConditions;
  },
  framework: 'jasmine2',
  jasmineNodeOpts: {
    showColors: true
  },
};
