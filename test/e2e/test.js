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
    var num = new Date().getTime();
    
    //  beforeEach(function () {
        
    //  });

    // fixed
    // iit() only this test will run.
    it('Should Navigate To Site on the server', function () {
        console.log('Navigate');
        browser.driver.get('http://localhost:3002/');
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

    //fixed
    it('Should Exit from the site', function () {
        element(by.css('.avatar .name')).click();
        element(by.css('[ng-click="logout()"]')).click();
        browser.driver.wait(function () {
            return element(by.className('login-page')).isPresent();
        }, 3000);
        expect(browser.getLocationAbsUrl()).toMatch("/login");
    });

    //fixed login
      it('Should login to the site', function () {
        browser.driver.get('http://localhost:3002/');
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

    // fixed
    describe("Discussion", function(){
        //fixed
        it('should add a disscussion', function () {
            element(by.css('.add-menu')).click();
            element(by.css('[ng-click="createDiscussion()"]')).click();
        });

        //fixed
        it('should add name to discussion', function () {
            element(by.css('.description .title')).sendKeys('TestDiscussion' + num);
            var foo1 = element(by.css('.header-wrap .title .ng-binding'));
            expect(foo1.getText()).toEqual(foo1.getText());
        });


       //fixed
        it('Should add assignee', function(){
            var assignName = element(by.css('.user .tooltips'));
            assignName.click();
            var input = assignName.element(by.css('input'));
            input.clear().sendKeys('Dvora Gadasi' + protractor.Key.ENTER);
            expect(input.getAttribute('value')).toEqual('Dvora Gadasi');
        });

        //fixed
        it('add status', function () {
            var status = element(by.css('.status .ui-select-container .ui-select-match .btn .ui-select-match-text'));
            expect(status.getText()).toEqual('חדש');
        });

  
        //fixed
        it('add due-date', function () {
            var picker = element(by.css('.hasDatepicker'));
            picker.click();

            // get today's date
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth()+1; //January is 0!
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

            expect(picker.getAttribute('value')).toEqual(today);
          
        });

        it('click on schedule discussion button', function () {
            element(by.css('[ng-click="statusesActionsMap[discussion.status].method(discussion)"]')).click();
        });

        //fixed
        it('add watcher',function () {
            var watcherelm = element(by.css('#addMember')).click();
            watcherelm.element(by.css('[ng-click="$select.toggle($event)"]')).click();
            browser.driver.wait(function () {
            return element(by.css('.new-member-input')).isPresent();
        }, 5000);
            var inputwatcher = watcherelm.element(by.css('input'));
            inputwatcher.clear().sendKeys('rivka' + protractor.Key.ENTER);
            expect(inputwatcher.getAttribute('value')).toEqual('rivka');
        });

        // it('attach a file to discussion', function(){
        //        
        // });
    });


    describe("Project", function(){
        it('should add a project', function(){
            element(by.css('.add-menu')).click();
            element(by.css('[ng-click="createProject()"]')).click();
        });
        //לתקן
        // it('should add name to project', function () {
        //     element(by.css('.description .title')).sendKeys('NewProjectTest');
        //     var foo1 = element(by.css('.header-wrap .title .ng-binding'));
        //     expect(foo1.getText()).toEqual('"NewProjectTest"');
        // });
    });
    //  it('Should login with google ', function () {
         
    //     beforeEach(function(){
    //     // ptor = protractor.getInstance();
    //     // driver = ptor.driver;
    //     browser.get('http://localhost:3002/');
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
//             browser.driver.get('http://localhost:3002/');
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
});
