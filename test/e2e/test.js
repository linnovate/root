const url = require('url');
const { expect } = require('chai').use(require('chai-as-promised'));

const meanConfig = require('meanio').loadConfig();

const num = new Date().getTime();
const rootUrl = new url.URL(process.env.ROOT_URL || meanConfig.host);

if(!process.env.ROOT_URL) {
  rootUrl.port = meanConfig.https.port || meanConfig.http.port;
}

describe('Root', function() {

  describe('Authentication', function() {
    it('Navigate to site', function() {
      browser.driver.get(rootUrl.href);
      expect(browser.driver.getTitle()).to.eventually.equal('ICU');
    });

    it('Navigate to registration', function() {
      element(by.css('[class="or-register ng-binding"]')).click();
      expect(browser.getCurrentUrl()).to.eventually.match(/register$/);
    });

    it('Register', function() {
      // fill input fields
      element(by.model('credentials.name')).sendKeys("Test" + num);
      element(by.model('credentials.email')).sendKeys("testsqaqa+" + num + "@gmail.com");
      element(by.model('credentials.username')).sendKeys("Test+" + num);
      element(by.model('credentials.password')).sendKeys("newstrat");
      element(by.model('credentials.confirmPassword')).sendKeys("newstrat");

      // submit
      element(by.className('btn')).click();

      browser.driver.wait(function() {
        return element(by.css('.add-menu')).isPresent();
      }, 5000);
      expect(browser.getCurrentUrl()).to.eventually.match(/tasks$/);
    });

    it('Confirm the "What\'s new" popup', function() {
      //element(by.buttonText('Don\'t show me again')).click();
      element(by.buttonText('אל תראה לי שוב')).click();
      browser.waitForAngular();
    })

    it('Logout', function() {
      element(by.css('.user-menu')).click();
      // element(by.linkText('Logout')).click();
      element(by.linkText('התנתק')).click();
      browser.driver.wait(function() {
        return element(by.className('login-page')).isPresent();
      }, 3000);
      expect(browser.getCurrentUrl()).to.eventually.match(/login$/);
    });

    it('Login again', function() {
      let userIcon = element(by.css('.user-menu .avatar span'));

      // fill input fields
      element(by.model('credentials.email')).sendKeys("testsqaqa+" + num + "@gmail.com");
      element(by.model('credentials.password')).sendKeys("newstrat");

      // submit
      // element(by.buttonText('Login')).click();
      element(by.buttonText('התחבר')).click();

      browser.driver.wait(function() {
        return userIcon.isPresent();
      }, 3000);

      expect(userIcon.getText()).to.eventually.equal('T');
    });
  });

  describe('Project', function() {
    let pName = 'NewProjectTest';
    let tName = 'NewTaskTestForProject';

    it('Create project', function() {
      element(by.css('.add-menu')).click();
      // element(by.cssContainingText('.add-menu a span', 'Project')).click();
      element(by.cssContainingText('.add-menu a span', 'פרויקט')).click();
      browser.waitForAngular();
    });

    it('Set project name', function() {
      element(by.css('.item-title')).sendKeys(pName);
      expect(element(by.css('.projects tr.active td.name')).getText()).to.eventually.equal(pName);
    });

    it('Set project color', function() {
      element(by.css('.select-box .arrow')).click();
      element.all(by.repeater('color in colors')).get(4).click();
      var colorBox = element(by.css('.color-box'));
      expect(colorBox.getAttribute('style')).to.eventually.equal('background-color: rgb(240, 110, 170);');
    });

    it('Create task', function() {
      element(by.css('.add-menu')).click();
      // element(by.cssContainingText('.add-menu a span', 'Task')).click();
      element(by.cssContainingText('.add-menu a span', 'משימה')).click();
      browser.waitForAngular();
    });

    it('Set task name', function() {
      element(by.css('.item-title')).sendKeys(tName);
      expect(element(by.css('.projects tr.active td.name')).getText()).to.eventually.equal(tName);
      expect(element(by.css('.projects tr.active td.project span')).getText()).to.eventually.equal(pName);
    });

    it('Add watcher', function() {
      element(by.css('#addMember')).click();
      let member = element(by.css('.new-member-input'));
      let input = member.element(by.model('$select.search'));

      member.element(by.css('[ng-click="$select.activate()"]')).click();

      input.clear().sendKeys("Test" + num);
      input.sendKeys(protractor.Key.ARROW_DOWN);
      input.sendKeys(protractor.Key.ENTER);
      expect(input.getAttribute('value')).to.eventually.equal("Test" + num);
    });
  });

  describe('Discussion', function() {

    let dName = 'NewDiscussionTest';
    let tName = 'NewTaskTestForDiscussion';

    it('Create disscussion', function() {
      element(by.css('.add-menu')).click();
      // element(by.cssContainingText('.add-menu a span', 'Discussion')).click();
      element(by.cssContainingText('.add-menu a span', 'דיון')).click();
      browser.waitForAngular();
    });

    it('Set discussion name', function() {
      element(by.css('.item-title')).sendKeys(dName);
      expect(element(by.css('.projects tr.active td.name')).getText())
        .to.eventually.equal(dName);
    });

    it('Set assignee', function() {
      let assign = element(by.css('.entity-details detail-assign'));
      let input = assign.element(by.model('$select.search'));

      assign.element(by.css('span[tabindex]')).click();

      input.clear().sendKeys("Test" + num);
      input.sendKeys(protractor.Key.ARROW_DOWN);
      input.sendKeys(protractor.Key.ENTER);
      expect(element(by.css('detail-assign .summary-content')).getText())
        .to.eventually.equal("Test" + num);
    });

    it('Set due date', function() {
      var input = element(by.css('discussion-due .detail-due input'))
      input.click();
      browser.waitForAngular();
      element(by.css('#allDay')).click();
      element(by.css('#startDate')).click();
      element(by.css('.ui-datepicker-next')).click();
      element(by.css('.ui-datepicker')).element(by.linkText('1')).click();
      browser.waitForAngular();

      element(by.css('#firstStr')).getText().then(function(text) {
        // reverse order to YYYY/M/D, in order to get correct date by Date constructor
        text = text.split('/').reverse().join('/');

        let expectedDate = new Date();
        expectedDate.setMonth(expectedDate.getMonth()+1, 1);
        let actualDate = new Date(text);
        expect(actualDate.toDateString()).to.equal(expectedDate.toDateString());
      })
    });

    it('Set location', function() {
      element(by.css('.location input')).sendKeys('Test place');
    });

    it('Schedule discussion', function() {
      // element(by.buttonText('Schedule discussion')).click();
      element(by.buttonText('זמן דיון')).click();
      browser.waitForAngular();
      let status = element(by.css('detail-status .ui-select-match-text span'));
      // expect(status.getText()).to.eventually.equal('Scheduled');
      expect(status.getText()).to.eventually.equal('זומן');
    });

    it('Add watcher', function() {
      element(by.css('#addMember')).click();
      let member = element(by.css('.new-member-input'));
      let input = member.element(by.model('$select.search'));

      member.element(by.css('[ng-click="$select.activate()"]')).click();

      input.clear().sendKeys("Test" + num);
      input.sendKeys(protractor.Key.ARROW_DOWN);
      input.sendKeys(protractor.Key.ENTER);
      expect(input.getAttribute('value')).to.eventually.equal("Test" + num);
    });

    it('Create task', function() {
      // element(by.buttonText('Manage Tasks')).click();
      element(by.css('.detail-tabs-switcher')).element(by.buttonText('משימות')).click();
      // element(by.css('.detail-tabs-switcher')).element(by.buttonText('משימות')).click();
      element(by.buttonText('נהל משימות')).click();
      element(by.css('.projects .create-new-item')).click();
      element(by.css('.item-title')).sendKeys(tName);
      expect(element(by.css('.projects tr.active td.name')).getText()).to.eventually.equal(tName);
    });
  });
});
