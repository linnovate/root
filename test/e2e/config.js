exports.config = {
  specs: [__dirname + '/test.js'],
  onPrepare: function() {
    browser.driver.manage().window().maximize();
    browser.manage().timeouts().pageLoadTimeout(12000);
  },
  onComplete: function() {
    return browser.quit();
  },
  framework: 'mocha',
  mochaOpts: {
    timeout: 5000,
    slow: 3000,
    reporter: 'spec'
  },
};
