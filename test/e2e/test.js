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

    describe('Registration Functionality Testing, login and logout Testing', function () {

        it('Should Navigate To Site on the server', function () {
            console.log('Navigate');
            browser.driver.get(localDomain);
            browser.manage().timeouts().pageLoadTimeout(12000);
            expect(browser.driver.getTitle()).toEqual('MEAN - A Modern Stack - Test');
            console.log('expect getTitle toEqual ICU');
        });

        it('Should Navigate To Registration', function () {
            element(by.css('[class="or-register ng-binding"]')).click();
            expect(browser.getLocationAbsUrl()).toMatch("/register");
        });

        it('Should fill the form registration', function () { 
            name.sendKeys("Test");
            email.sendKeys("testsqaqa+" + num + "@gmail.com");
            userName.sendKeys("Test+" + num);
            pass.sendKeys("newstrat");
            confirmPass.sendKeys("newstrat");
            element(by.className('btn')).click();
            browser.driver.wait(function () {
                return element(by.css('.add-menu')).isPresent();
            }, 5000);
            expect(browser.getLocationAbsUrl()).toMatch("/tasks");
        });

        it('Should Exit from the site', function () {
            element(by.css('.avatar .name')).click();
            element(by.css('[ng-click="logout()"]')).click();
            browser.driver.wait(function () {
                return element(by.className('login-page')).isPresent();
            }, 3000);
            expect(browser.getLocationAbsUrl()).toMatch("/login");
        });

        it('Should login to the site', function () {
            browser.driver.get(localDomain);
            email.sendKeys("testsqaqa+" + num + "@gmail.com");
            pass.sendKeys("newstrat");
            element(by.className('btn')).click();
            browser.waitForAngular();
            browser.driver.wait(function () {
                return element(by.css('[ng-click="removeFilterValue()"]')).isPresent();
            }, 3000);
            var foo = element(by.css('.avatar .name'));
            expect(foo.getText()).toEqual('T');
        });
    });
    
    describe("Discussion", function() {

        it('should add a disscussion', function () {
            element(by.css('.add-menu')).click();
            element(by.css('[ng-click="createDiscussion()"]')).click();
        });

        it('should add name to discussion', function () {
            element(by.css('.description .title')).sendKeys('TestDiscussion' + num);
            var foo1 = element(by.css('.header-wrap .title .ng-binding'));
            expect(foo1.getText()).toEqual(foo1.getText());
        });

        it('Should add assignee', function(){
            var assignName = element(by.css('.user .tooltips'));
            assignName.click();
            var input = assignName.element(by.css('input'));
            input.clear().sendKeys('Dvora Gadasi' + protractor.Key.ENTER);
            console.log('assignee');
            expect(input.getAttribute('title')).toEqual('Dvora Gadasi');
        });

        it('add status', function () {
            var status = element(by.css('.status .ui-select-container .ui-select-match .btn .ui-select-match-text'));
            expect(status.getText()).toEqual('New');
        });

        it('add due-date', function () {
            var picker = element(by.css('.hasDatepicker'));
            picker.click();

            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth()+1;
            var yyyy = today.getFullYear();

            if(dd<10) {
                dd='0'+dd
            }

            if(mm<10) {
                mm='0'+mm
            } 

            today = mm+'/'+dd+'/'+yyyy;

            picker.clear();
            picker.sendKeys(today);

        expect(element(by.css('[ng-click="statusesActionsMap[discussion.status].method(discussion)"]')).isEnabled()).toBe(true);
        });

        it('click on schedule discussion button', function () {
            element(by.css('[ng-click="statusesActionsMap[discussion.status].method(discussion)"]')).click();
        });

        it('add watcher to discussion',function () {
            var watcherelm = element(by.css('#addMember')).click();
            browser.driver.wait(function () {
            return element(by.css('.new-member-input')).isPresent();
        }, 5000);

            var member = element(by.css('.new-member-input'));
            member.element(by.css('[ng-click="$select.toggle($event)"]')).click();
            var inputwatcher = member.element(by.css('input'));
            inputwatcher.clear().sendKeys('rivka' + protractor.Key.ENTER);
            expect(inputwatcher.getAttribute('value')).toEqual('rivka');
        });

// ============================= run after fix the bug =================================

        it('create a task on a discussion', function () {
            element(by.css('.switcher .active')).click();
            element(by.css('[ng-click="manageTasks()"]')).click();
            var ListTasks = element.all(by.repeater('task in tasks | filterByOptions | orderBy:order.field:order.isReverse'));
            ListTasks.then(function(rows) {
                for (var i = 0; i < rows.length; ++i) {
                    if(rows[i] == rows.length){
                        ListTasks.get(rows[i]).click();
                        ListTasks.get(rows[i]).sendKeys('task1');
                    }
                } 
            });
            expect(ListTasks.get(rows[i]).getText()).toEqual('"task1"');
        });

        it('attach a file to task on discussion', function() {
            var ListDiscussions = element.all(by.repeater('discussion in discussions | orderBy:order.field:order.isReverse'));
            ListDiscussions.get(0).click();
            var actionButtons = element(by.css('.action-buttons .attachment'));
            
                var fileToUpload = 'documents/doc-sample1.doc',
                absolutePath = path.resolve(__dirname, fileToUpload);

                actionButtons.sendKeys(absolutePath);
                actionButtons.click();
                var actbtn = element(by.css('.action-buttons .name'));
                expect(actbtn.getText()).toBe('doc-sample1.doc');
        });
//===========================================================================================================================
        it('delete a discussion', function () {
            element(by.css('.dropdown-container')).click();
            element(by.css('.fa-times-circle')).click();
            var listTable = element(by.css('.list-table'));
            expect(listTable).not.toContain('TestDiscussion' + num);
        });

    });

    describe("Project", function() {
        it('should add a project', function(){
            element(by.css('.add-menu')).click();
            element(by.css('[ng-click="createProject()"]')).click();
        });

        it('should add name to project', function () {
            element(by.css('.description .title')).sendKeys('NewProjectTest');
            var projectName = element(by.css('.header-wrap .title .ng-binding'));
            expect(projectName.getText()).toEqual('"NewProjectTest"');

        });

        it('should select a color to project', function () {
            element(by.css('.select-box .arrow')).click();
            element.all(by.repeater('color in colors')).get(4).click();;
            var colorBox = element(by.css('.color-box'));
            expect(colorBox.getAttribute('style')).toEqual('background-color: rgb(240, 110, 170);');
        });

        //fixed - but have a bug
        it('add watcher to project',function () {
            var watcherelm = element(by.css('#addMember')).click();
            browser.driver.wait(function () {
            return element(by.css('.new-member-input')).isPresent();
        }, 5000);
            var member = element(by.css('.new-member-input'));
            member.element(by.css('[ng-click="$select.activate()"]')).click();
            var inputwatcher = member.element(by.css('input'));
            inputwatcher.clear().sendKeys('rivka' + protractor.Key.ENTER);
            expect(inputwatcher.getAttribute('value')).toEqual('rivka');

        });

        it('create a task on project', function () {
            element(by.css('.action-bar')).click();
            element(by.css('[ng-click="manageTasks()"]')).click();
            var ListTasks = element.all(by.repeater('task in tasks | filterByOptions | orderBy:order.field:order.isReverse'));
            ListTasks.then(function(rows) {
                for (var i = 0; i < rows.length; ++i) {
                    if(rows[i] == rows.length){
                        ListTasks.get(rows[i]).click();
                        ListTasks.get(rows[i]).sendKeys('task1');
                    }
                }
            });
            expect(ListTasks.get(rows[i]).getText()).toEqual('"task1"');
        });
    });
 });
