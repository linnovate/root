describe('Registration Functionality Testing', function () {
    var name = element(by.model('credentials.name'));
    var email = element(by.model('credentials.email'));
    var userName = element(by.model('credentials.username'));
    var pass = element(by.model('credentials.password'));
    var confirmPass = element(by.model('credentials.confirmPassword'));
    var btn = element(by.className('btn ng-binding'));
    var letter = element(by.className('name ng-binding ng-scope'));
    var dropdownToggle = element(by.className('dropdown-toggle'));
    var discussion = element(by.binding('Discussion'));
    //fixed
    it('Should Navigate To Site on dev6', function () {
        browser.driver.get('http://icu.dev6.linnovate.net/');
        expect(browser.driver.getTitle()).toEqual('ICU');
    });

    //fixed login
    it('Should login to the site', function () {
        browser.driver.get('http://icu.dev6.linnovate.net');
        email.sendKeys("orit@linnovate.net");
        pass.sendKeys("newstart");
        element(by.className('btn')).click();
        browser.waitForAngular();
        browser.driver.wait(function () {
            return element(by.css('[ng-click="removeFilterValue()"]')).isPresent();
        }, 3000);
        var foo = element(by.css('.avatar .name'));
        expect(foo.getText()).toEqual('o');
    });
    //fixed
    it('should add a disscussion', function () {
        element(by.css('.add-menu')).click();
        element(by.css('[ng-click="createDiscussion()"]')).click();
    });

    //fixed
    it('should add name to discussion', function () {
        element(by.css('.description .title')).sendKeys('TestDiscussion');
        var foo1 = element(by.css('.header-wrap .title .ng-binding'));
        expect(foo1.getText()).toEqual('"TestDiscussion"');
    });

    //fixed
    it('add status', function () {
        var status = element(by.css('.status .ui-select-container .ui-select-match .btn .ui-select-match-text'));
        expect(status.getText()).toEqual('New');
    });

    //fixed
    it('Should add assignee', function () {
        element(by.css('.user .ui-select-container .btn')).click();
        var selectChoicesGroup = element(by.css('.ui-select-choices-group'));
        for (var i = 0; i < selectChoicesGroup.length; i++) {
            var assignee = element(by.css('.ui-select-choices-content .ui-select-choices-row .summary-content')[i + 1]).click();
            expect(assignee.getText()).toEqual('tests');
        }
    });

    //fixed
    it('Should Exit from the site', function () {
        element(by.css('.avatar .name')).click();
        element(by.css('[ng-click="logout()"]')).click();
        browser.driver.wait(function () {
            return element(by.className('login-page')).isPresent();
        }, 3000);
        expect(browser.getLocationAbsUrl()).toMatch("/login");
    });
    //fixed
    it('Should Navigate To Registration', function () {
        element(by.css('[class="or-register ng-binding"]')).click();
        expect(browser.getLocationAbsUrl()).toMatch("/register");
    });

    //fixed registration
    it('Should fill the form registration', function () {
        var num = new Date().getTime();
        name.sendKeys("Dvora");
        email.sendKeys("Dvora+" + num + "@linnovate.net");
        userName.sendKeys("Dvora+" + num);
        pass.sendKeys("newstrat");
        confirmPass.sendKeys("newstrat");
        element(by.className('btn')).click();
        browser.driver.wait(function () {
            return element(by.css('.add-menu')).isPresent();
        }, 5000);
        expect(browser.getLocationAbsUrl()).toMatch("/tasks");
    });
});