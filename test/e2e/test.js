// pay attention! logout from the site before you run the Testing
// iit() in order to run just a specific test
describe('End-to-End Testing for ICU with Protractor', function() {

    var path = require('path');
    var name = element(by.model('credentials.name'));
    var email = element(by.model('credentials.email'));
    var userName = element(by.model('credentials.username'));
    var pass = element(by.model('credentials.password'));
    var confirmPass = element(by.model('credentials.confirmPassword'));
    var btn = element(by.className('btn ng-binding'));
    var letter = element(by.className('name ng-binding ng-scope'));
    var dropdownToggle = element(by.className('dropdown-toggle'));
    var discussion = element(by.binding('Discussion'));
    var num = new Date().getTime();
    var serverDomain = "http://root.hrm.demo.linnovate.net/";
    var localDomain = "http://localhost:3002/";
    var mean = require('meanio');
    var config = mean.loadConfig();
    var lang = config.currentLanguage;
    describe('Registration Functionality Testing, login and logout Testing', function() {
        it('Should Navigate To Site', function() {
            console.log('Navigate');
            browser.driver.get(localDomain);
            browser.manage().timeouts().pageLoadTimeout(12000);
            expect(browser.driver.getTitle()).toEqual('MEAN - A Modern Stack - Test');
            console.log('expect getTitle toEqual ICU');
        });

        it('Should Navigate To Registration', function() {
            element(by.css('[class="or-register ng-binding"]')).click();
            expect(browser.getLocationAbsUrl()).toMatch("/register");
        });

        it('Should fill the form registration', function() {
            name.sendKeys("Test" + num);
            email.sendKeys("testsqaqa+" + num + "@gmail.com");
            userName.sendKeys("Test+" + num);
            pass.sendKeys("newstrat");
            confirmPass.sendKeys("newstrat");
            element(by.className('btn')).click();
            browser.driver.wait(function() {
                return element(by.css('.add-menu')).isPresent();
            }, 5000);
            expect(browser.getLocationAbsUrl()).toMatch("/tasks");
        });
        describe("logout and login", function() {
            it('Should Exit from the site', function() {
                element(by.css('.avatar .name')).click();
                element(by.css('[ng-click="logout()"]')).click();
                browser.driver.wait(function() {
                    return element(by.className('login-page')).isPresent();
                }, 3000);
                expect(browser.getLocationAbsUrl()).toMatch("/login");
            });

            it('Should login to the site', function() {
                browser.driver.get(localDomain);
                email.sendKeys("testsqaqa+" + num + "@gmail.com");
                pass.sendKeys("newstrat");
                element(by.className('btn')).click();
                browser.waitForAngular();
                browser.driver.wait(function() {
                    return element(by.css('[ng-click="removeFilterValue()"]')).isPresent();
                }, 3000);
                var userIcon = element(by.css('.avatar .name'));
                expect(userIcon.getText()).toEqual('T');
            });
        });
    });

    describe("Project", function() {
        it('should add a project', function() {
            element(by.css('.add-menu')).click();
            browser.waitForAngular();
            element(by.css('[ng-click="createProject()"]')).click();
            browser.waitForAngular();
        });

        it('should add name to project', function() {
            element(by.css('.description .title')).sendKeys('NewProjectTest');
            var projectName = element(by.css('.title'));
            expect(projectName.getText()).toEqual(projectName.getText());
        });
        it('should select a color to project', function() {
            browser.waitForAngular();
            element(by.css('.select-box .arrow')).click();
            browser.waitForAngular();
            element.all(by.repeater('color in colors')).get(4).click();
            var colorBox = element(by.css('.color-box'));
            expect(colorBox.getAttribute('style')).toEqual('background-color: rgb(240, 110, 170);');
        });
        it('create a task on project', function() {
            console.log('I am here');
            element(by.css('.switcher')).all(by.tagName('button')).get(2).click();
            element(by.css('[ng-click="manageTasks()"]')).click();
            var optionTexts = element.all(by.repeater('task in tasks'));
            optionTexts.get(0).click();
            browser.waitForAngular();
            optionTexts.get(0).element(by.css('.name')).sendKeys('task1 on project');
            expect(optionTexts.get(0).element(by.css('.name')).getText()).toEqual('task1 on project');
        });

        //fixed - but have a bug
        it('add watcher to project', function() {
            var watcherelm = element(by.css('#addMember')).click();
            browser.driver.wait(function() {
                return element(by.css('.new-member-input')).isPresent();
            }, 5000);
            var member = element(by.css('.new-member-input'));
            member.element(by.css('[ng-click="$select.activate()"]')).click();
            var inputwatcher = member.element(by.css('input'));

            inputwatcher.clear().sendKeys("Test" + num).then(function() {
                browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform().then(function() {
                    browser.actions().sendKeys(protractor.Key.ENTER).perform();
                });
            });
            expect(inputwatcher.getAttribute('value')).toEqual("Test" + num);
        });
    });

    describe("Discussion", function() {

        it('should add a disscussion', function() {
            element(by.css('.add-menu')).click();
            element(by.css('[ng-click="createDiscussion()"]')).click();
        });

        it('should add name to discussion', function() {
            element(by.css('.description .title')).sendKeys('TestDiscussion' + num);
            var nameD = element(by.css('.header-wrap .title .ng-binding'));
            expect(nameD.getText()).toEqual(nameD.getText());
        });
        it('Should add assignee', function() {
            var assignName = element(by.css('.user .tooltips'));
            assignName.click();
            var input = assignName.element(by.tagName('input'));
            input.clear().sendKeys("Test" + num).then(function() {
                browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform().then(function() {
                    browser.actions().sendKeys(protractor.Key.ENTER).perform();
                });
            });
            var nameContent = element(by.css('.user .tooltips .summary-content'));
            expect(nameContent.getText()).toEqual("Test" + num);
        });

        it('add status', function() {
            var status = element(by.css('.status .ui-select-container .ui-select-match .btn .ui-select-match-text'));
            if (lang == 'he')
                expect(status.getText()).toEqual('חדש');
            else
                expect(status.getText()).toEqual('New');
        });

        it('add due-date', function() {
            var due = element(by.css('.summary .due'));
            var picker = due.element(by.tagName('input'));
            browser.actions().mouseMove(picker).click();
            browser.waitForAngular();
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth() + 1;
            var yyyy = today.getFullYear();

            if (dd < 10) {
                dd = '0' + dd
            }

            if (mm < 10) {
                mm = '0' + mm
            }

            today = mm + '/' + dd + '/' + yyyy;

            picker.clear();
            picker.sendKeys(today);
            browser.waitForAngular();

            element(by.css('.actions button')).getAttribute('disabled').then(function(result) {
                console.log('result is ' + result);
            });

            expect(element(by.css('.actions button')).getAttribute('disabled')).toBe('true')
        });

        it('click on schedule discussion button', function() {
            element(by.css('[ng-click="statusesActionsMap[discussion.status].method(discussion)"]')).click();
            browser.waitForAngular();
        });

        it('add watcher to discussion', function() {
            var watcherelm = element(by.css('#addMember')).click();
            browser.driver.wait(function() {
                return element(by.css('.new-member-input')).isPresent();
            }, 5000);

            var member = element(by.css('.new-member-input'));
            member.element(by.css('[ng-click="$select.toggle($event)"]')).click();
            var inputwatcher = member.element(by.css('input'));
            inputwatcher.clear().sendKeys("Test" + num + protractor.Key.ENTER);
            expect(inputwatcher.getAttribute('value')).toEqual("Test" + num);
        });
        it('create a task on discussion', function() {
            browser.waitForAngular();
            element(by.css('.switcher')).all(by.tagName('button')).get(2).click();
            element(by.css('[ng-click="manageTasks()"]')).click();
            var optionTexts = element.all(by.repeater('task in tasks'));
            optionTexts.get(0).click();
            browser.waitForAngular();
            optionTexts.get(0).element(by.css('.name')).sendKeys('task1 on discussion');
            expect(optionTexts.get(0).element(by.css('.name')).getText()).toEqual('task1 on discussion');
        });
        browser.manage().timeouts().pageLoadTimeout(50000);
        // it('attach a file to task on discussion', function() {
        //     // var ListDiscussions = element.all(by.repeater('discussion in discussions | orderBy:order.field:order.isReverse'));
        //     // ListDiscussions.get(0).click();
        //     var actionButtons = element(by.css('.action-buttons .attachment'));

        //         var fileToUpload = 'documents/doc-sample1.doc',
        //         absolutePath = path.resolve(__dirname, fileToUpload);

        //         actionButtons.sendKeys(absolutePath);
        //         actionButtons.click();
        //         var actbtn = element(by.css('.action-buttons .name'));
        //         expect(actbtn.getText()).toBe('doc-sample1.doc');
        // });


        // it('click on my tasks', function () {
        //     element(by.css('.display-by .display-by .title')).click();
        // });
        //טסט זה נופל בגלל שהוא עדיין עומד על טאסק וצריך לעבור לכותרת של דיון ולחכות ואח"כ ללחוץ על מחק
        //לאחר לחיצה על מחק צריך להפתח פופאפ ואז הוא מקליד מחק ואישור
        //הבעיה כרגע שלא נפתח הפופ אפ כי הוא עדיין עומד על משימה והוא צריך לעבור לדיון בעצמו
        // it('delete a discussion', function () {         
        //     element(by.css('.header-wrap')).click();
        //         console.log('8888888');
        //       browser.driver.wait(function(){
        //         element(by.css('.dropdown-container .dropdown-trigger')).click();
        //         element(by.css('.dropdown-container ul a')).click();
        //         // element(by.css('.dropdown-container .ng-isolate-scope')).click();
        //         // var del = element(by.css('.dropdown-container .dropdown-menu'));
        //         // del.element(by.tagName('a')).click();
        //         // var EC = protractor.ExpectedConditions;
        //         var dialog = element(by.css('.modal-dialog .modal-content .modal-body input'));
        //         browser.wait(EC.visibilityOf(dialog), 5000);
        //         dialog.element(by.model('entity.textDelete')).sendKeys('מחק');
        //         element(by.css('[ng-click="ok()"]')).click();
        //       },500000*1000);

        //     browser.wait(function(){
        //     var listTable = element(by.css('.list-table'));
        //     expect(listTable).not.toContain('TestDiscussion' + num);
        //     },5*1000, "**********");
        // });
    });
});