// describe('BrowserStack Local Testing', function() {
//   it('can check tunnel working', function() {
//     browser.driver.get('http://bs-local.com:45691/check').then(function() {
//       expect(browser.driver.getPageSource()).toMatch(/Up and running/i);
//     });
//   });
// });

// pay attention! logout from the site before you run the Testing
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

    // fixed
    // iit() only this test will run.
    it('Should Navigate To Site on the server', function () {
        console.log('Navigate');
        browser.driver.get('http://localhost:3009/');
        browser.manage().timeouts().pageLoadTimeout(12000);  // 12 seconds
        expect(browser.driver.getTitle()).toEqual('ICU');
        console.log('expect getTitle toEqual ICU');
    });

    //fixed
    it('Should Navigate To Registration', function () {
        element(by.css('[class="or-register ng-binding"]')).click();
        expect(browser.getLocationAbsUrl()).toMatch("/register");
    });

    //fixed registration
    it('Should fill the form registration', function () {
        var num = new Date().getTime();
        name.sendKeys("Test");
        email.sendKeys("dvorad+" + num + "@linnovate.net");
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

    //  it('Should login with google ', function () {
         
    //     beforeEach(function(){
    //     // ptor = protractor.getInstance();
    //     // driver = ptor.driver;
    //     browser.get('http://root.hrm.demo.linnovate.net/auth');
    //     browser.sleep(30000);
    //     });

    //      browser.driver.manage().window().maximize();
         
    //      if (element(by.css('.social_icon a')).isPresent()){
    //          console.log('social_icon isPresent');
    //          element(by.css('.social_icon_google a')).click().then(function (p) {
               
    //               browser.driver.wait(browser.driver.isElementPresent(by.id('Email')));
    //            // browser.driver.wait(browser.driver.isElementPresent(by.id('Email')));
    //         });;


                
                
    //             // element(by.css('.social_icon a')).click();
    //             browser.sleep(10000);
    //             element(by.css('[id="Email"]')).sendKeys("testsqaqa@gmail.com");
    //             element(by.css('.rc-button')).click();
    //             element(by.css('[id="Passwd"]')).sendKeys("dvora123");
    //             console.log('+++++++++++++++');
    //             element(by.css('.rc-button')).click();
    //             console.log('***********************');
    //             browser.driver.wait(function () {
    //                 console.log('-------------------------');
    //                     return element(by.css('[ng-click="removeFilterValue()"]')).isPresent();
    //                 }, 3000);
    //                     var foo = element(by.css('.avatar .name'));
    //                 expect(foo.getText()).toEqual('t');
    //             console.log('///////////////////////');

    //      }
       
    //  });
//     describe('login with google', function () {
   
//         beforeEach(function () {
//             browser.driver.get('http://localhost:3009/');
//         },10000);

//         it("should start the test", function () {   
//             console.log('should start the test');
//             describe("starting", function () {
//                 it("should find the button and start the test", function(){
//                     var elementToFind = by.css('.social_icon a'); //what element we are looking for
//                     var elementToFind2 = by.css('#lala'); //what element we are looking for

//                     console.log("elementToFind", elementToFind2);
//                     browser.driver.isElementPresent(elementToFind2).then(function(isPresent){
//                         expect(isPresent).toBe(true); //the test, kind of redundant but it helps pass or fail
//                         // browser.driver.findElement(elementToFind).then(function(){
//                         //     elementToFind.click().then(function(){ //once we've found the element and its on the page click it!! :) 
//                         //         console.log("****************");    

//                         //     });
//                         // });

//                         element(elementToFind2).click().then(function(){
//                     console.log("typed in random message");
//                     // continueOn();
//                         });
//                     });
//                 });
//             });
//         },30000);
 

//  });

    //fixed login
      it('Should login to the site', function () {
        browser.driver.get('http://localhost:3009/login');
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
  
  
    // fixed
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

        it('add due-date', function () {
        // element(by.css('.hasDatepicker')).click();
        
        // browser.findElement(by.xpath("//div[@class='summary']/div[@class='actions']")).click();
        // browser.findElement(by.xpath("//div[@class='summary']/div[@class='actions']"));
        console.log('btn',browser.findElement(by.xpath("//div[@class='summary']")));
        // /div[@class='actions']/button
        // driver.findElementByXpath("//div[@class='summary']/div[@class='actions']").click();
        // // jQuery('.hasDatepicker:first').focus();
        // var due = element(by.className('.due input[ng-model="discussion.due"]'));
        // due.click();
        // element(by.css('. ui-datepicker-today')).click();
        // expect...    
    });

    // it('click on schedule discussion button', function () {
    //     element(by.css('[ng-click="statusesActionsMap[discussion.status].method(discussion)"]')).click();
    // });

    // it('add status', function () {
    //     var status = element(by.css('.status .ui-select-container .ui-select-match .btn .ui-select-match-text .new'));
    //     expect(status.getText()).toEqual('New');
    // });

    //fixed

    // it('add watcher',function () {
    //     element(by.css('#addMember')).click();
    // //     browser.driver.wait(function () {
    // //     return element(by.css('.new-member-input')).isPresent();
    // // }, 5000);
    // //     element(by.css('.new-member-input .btn')).click();
    //     // console.log('ttt', element(by.css('.new-member-input .ui-select-container .ui-select-choices .ui-select-choices-group .ui-select-choices-row')[0]));
    // //     element(by.css('.new-member-input .ui-select-container .ui-select-choices .ui-select-choices-group .ui-select-choices-row')[0]).click();
    // });


    //fixed

});


