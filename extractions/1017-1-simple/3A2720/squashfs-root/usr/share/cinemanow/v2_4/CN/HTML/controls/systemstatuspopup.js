//-----------------------------------------------------------------------------
// systemstatuspopup.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
var SystemStatusPopup = new Class({
	Extends:ModalControl,
	Implements:ModalControl,
    startTime: null,
	id: 'systemstatuspopup',
    slownessTimeout: null,
    slownessCheckupInterval: null,
    // TODO: cannot use resources here, since they are not yet defined by init. Fix that. Make regular variable that is included by compiler based on language option, or
    //   just include it, since there are no other languages currently.
    testsToPerformIndep: [  {   "funName": "testBandwidth",
                                "defaultString": "0",
                                "htmlLocation": "#SystemStatus .bwResults .theResult",
                                "htmlLocation2": "#SystemStatus .bwSummary .theResult",
                                "completed": false,
                                "result": null
                            },
                            {   "funName": "testConnectionType",
                                "defaultString": "Not Connected",
                                "htmlLocation": "#SystemStatus .connectionResults .theResult",
                                "completed": false,
                                "result": null
                            },
                            {   "funName": "testActivationStatus",
                                "defaultString": "Not Connected",
                                "htmlLocation": "#SystemStatus .activationResults .theResult",
                                "completed": false,
                                "result": null
                            }],
    testsToPerformDep: [    {   "funName": "testIpAddress",
                                "defaultString": "Not Connected",
                                "htmlLocation": "#SystemStatus .ipResults .theResult",
                                "completed": false,
                                "result": null
                            },
                            {   "funName": "testEmailAddress",
                                "defaultString": "Not Activated",
                                "htmlLocation": "#SystemStatus .emailResults .theResult",
                                "completed": false,
                                "result": null
                            },
                            {   "funName": "testResConnection",
                                "defaultString": "Not Connected",
                                "htmlLocation": "#SystemStatus .resResults .theResult",
                                "completed": false,
                                "result": null
                            }],
    _currentIndex: 0,
    initialize: function() {
        // This is the ID of the template to be used.
    	this.parent('systemstatuspopup');
        this.storeTestsAsData(this.testsToPerformDep, this.testsToPerformIndep);
	},
    storeTestsAsData: function() {
        var i,
            j;

        $cn.data.SystemTests = [];

        for (i = 0; i < arguments.length; ++i) {
            for (j = 0; j < arguments[i].length; ++j) {
                $cn.data.SystemTests.push(arguments[i][j]);
            }
        }
    },
	start: function() {
        this.testingFinished = false;
        this.clearPreviousResults();
        this.clearCompletedTests(this.testsToPerformIndep, this.testsToPerformDep);
        this.runTests(this.testsToPerformIndep);
        this.showResultsPanel();
        if ($cn.config.SystemStatusTimeoutS) {
            this.setSlownessTimeout($cn.config.SystemStatusTimeoutS);
        } else {
            log.write("XXXXXXXXXXX Warning XXXXXXXXXXXXXX");
            log.write("You are showing the System Status Popup without setting a timeout!!!");
            log.write("XXXXXXXXXXX Warning XXXXXXXXXXXXXX");
        }
        this.setSlownessCheckupInterval();
	},
    setSlownessTimeout: function(timeOutS) {
        var self = this;
        this.slownessTimeout = setTimeout(function() {
            self.testingDone();
        }, timeOutS * 1000);
    },
    setSlownessCheckupInterval: function() {
        // var self = this;
        var timeRemaining = $('SystemTestTimeRemaining');

        $cn.data.bwTest.intervalUpdated = true;

        this.slownessCheckupInterval = setInterval(function() {
            var timeLeft = parseInt(timeRemaining.innerHTML, 10) + 1;

            // Check to see if the BW test has updated things, if not increase time left
            if (! $cn.data.bwTest.intervalUpdated) {
                timeRemaining.innerHTML = timeLeft > $cn.config.SystemStatusTimeoutS ? $cn.config.SystemStatusTimeoutS : timeLeft;
            }

            // Reset
            $cn.data.bwTest.intervalUpdated = false;
        }, 1000);
    },
    showResultsPanel: function() {
        $$('#settingspanel .systemstatuscotainer').hide();
        $$('#settingspanel .systemstatusresults').show();
    },
    clearPreviousResults: function() {
        $$("#SystemStatus .systemstatusresults .theResult").each(function(ellie) {
            ellie.innerHTML = "";
        });
    },
    // Clears previous results, and puts in default strings in the DOM
    clearCompletedTests: function() {
        var i,
            j;

        for (i = 0; i < arguments.length; ++i) {
            for (j = 0; j < arguments[i].length; ++j) {
                arguments[i][j].completed = false;
                arguments[i][j].result = null;
                this.setDefaultForTest(arguments[i][j]);
            }
        }
    },
    // Pass in array of string, will do tests on those functions
    runTests: function(tests) {
        var i;

        for (i = 0; i < tests.length; ++i) {
            this[tests[i].funName](tests[i].funName);
        }
    },
    // Since some tests are asynchronous, this is here to track which ones are done or not
    testDone: function(testName) {
        var i,
            j,
            numDone = 0,
            tests = [this.testsToPerformIndep, this.testsToPerformDep],
            numTests = 0;

        log.write("completed test " + testName);
        this.getTest(testName).completed = true;

        for (i = 0; i < tests.length; ++i) {
            numTests = numTests + tests[i].length;
        }

        // Count how many tests are done
        for (i = 0; i < tests.length; ++i) {
            for (j = 0; j < tests[i].length; ++j) {
                if (tests[i][j].completed) {
                    numDone = numDone + 1;
                }
            }
        }

        log.write(numDone + " tests done out of " + numTests);
        if (numDone === numTests) {
            this.testingDone();
        }
    },
    getTest: function(testName) {
        var i;

        // Look in independent tests first
        for (i = 0; i < this.testsToPerformIndep.length; ++i) {
            if (testName === this.testsToPerformIndep[i].funName) {
                return this.testsToPerformIndep[i];
            }
        }

        // Then look in dependent tests
        for (i = 0; i < this.testsToPerformDep.length; ++i) {
            if (testName === this.testsToPerformDep[i].funName) {
                return this.testsToPerformDep[i];
            }
        }

        return null;
    },
    setString: function(selector, string) {
        log.write("###########");
        log.write("Setting: " + selector + " to: " + string);
        log.write("###########");
        $$(selector).set("html", string);
    },
    setDefaultForTest: function(test) {
        this.setString(test.htmlLocation, test.defaultString);
    },
    setStringForTest: function(test, string) {
        this.setString(test.htmlLocation, string);
    },
    testBandwidth: function(testName) {
        var download,
            test = this.getTest(testName);

        log.write("test BW " + testName + " begin");

        // This one is unusual in that it has 2 output location. Reset the second one too.
        this.setString(test.htmlLocation2, "");
        
        BandwidthCheck.popupBandwidthCheck(this, this.onBwTestUpdate, false);

    },
    testConnectionType: function(testName) {
        // 1 if active interface is wired,
        // 0 if active interface is wireless
        // -1 if no active connection
        var connectionType = -1;
        var test = this.getTest(testName);

        log.write("test Connection " + testName + " begin");

        if ($cn.utilities.Network.GetActiveType) {
            connectionType = $cn.utilities.Network.GetActiveType();
        } 
        else if (device.backupIPConnectionSupported) {
            connectionType = 1;
        }

        this.testIpAddress("testIpAddress", connectionType);
        switch(connectionType) {
            case -1:
                connectionType = application.resource.testing_messages.connectionType.none;
                break;
            case 0:
                connectionType = application.resource.testing_messages.connectionType.wireless;
                break;
            case 1:
                connectionType = application.resource.testing_messages.connectionType.wired;
                break;
            default:
                connectionType = application.resource.testing_messages.connectionType.unknown;
                break;
        }

        log.write("your connection is: " + connectionType);
        test.result = connectionType;
        this.testDone(testName);
    },
    testActivationStatus: function(testName) {
        var self = this,
            test = this.getTest(testName);

        log.write("test Activation " + testName + " begin");

        $cn.methods.verifyAuthToken(function(activated) {

            test.result = activated ? application.resource.testing_messages.activated : application.resource.testing_messages.notActivated;

            // We received an api response, so we're connected
            self.testResConnection("testResConnection");
            self.testEmailAddress("testEmailAddress", activated);

            self.testDone(testName);
        }, true); // <== Do not trigger timeouts
    },
    testIpAddress: function(testName, connectionType) {
        var ipAddress = "Unknown",
            test = this.getTest(testName);

        log.write("test IP " + testName + " begin");
        switch(connectionType) {
            case 0:
            case 1:
                log.write("about to get IP");
                if ($cn.utilities.Network.GetIP) {
                    log.write("getting ip for connection type: " + connectionType);
                    ipAddress = $cn.utilities.Network.GetIP(connectionType);
                } 
                else if (device.backupIPConnectionSupported) {
                    ipAddress = "127.0.0.1";
                }
                break;
        }

        test.result = ipAddress;
        log.write("your ip address is: " + ipAddress);
        this.testDone(testName);
    },
    testEmailAddress: function(testName, activated) {
        var self = this,
            test = this.getTest(testName);

        log.write("test Email " + testName + " begin");

        if (activated) {
            $cn.methods.loadToken(function() {
                if ($cn.data.UserEmailAddress) {
                    test.result = $cn.data.UserEmailAddress;
                }
                self.testDone(testName);
            }, true); // <== Do not trigger timeouts
        } else {
            test.result = test.defaultString;
            self.testDone(testName);
        }
    },
    testResConnection: function(testName) {
        var test = this.getTest(testName);

        log.write("test RES " + testName + " begin");

        // Don't know how to do this. Let's assume that activation status proves we can connect to store.
        test.result = application.resource.testing_messages.connected;

        this.testDone(testName);
    },
    testingDone: function() {
        this.testingFinished = true;
        log.write("$$$$ done with all tests");
        if (this.slownessTimeout) {
            clearTimeout(this.slownessTimeout);
        }
        if (this.slownessCheckupInterval) {
            clearInterval(this.slownessCheckupInterval);
        }
        if(!this.getTest('testBandwidth').completed){
            BrowseView.bwMessage();
        }
        this.hide();
    },
    onBwTestUpdate: function(p) {
        var systemBar = $('SystemStatusBar'),
            timeRemaining = $('SystemTestTimeRemaining'),
            timeElapsed,
            percentLeft,
            secondsPerPercent,
            test;
        if (systemBar) {
            $("SystemStatusMessage").set("html", application.resource.testing_messages.testingBandwidth);

            if (p) {
                var params = p.split('?');
                log.write(p);

                //Value is in bytes per second
                switch (params[0]) {
                    case "Complete" : // test is complete
                        log.write("Speedtest: " + $cn.data.bwTest.speedBytes + " bytes per sec.");
                        log.debug("Speedtest: " + $cn.data.bwTest.speedBytes + " bytes per sec.");
                        test = $cn.data.bwTest.self.getTest("testBandwidth");
                        test.result = parseInt($cn.data.bwTest.speedBytes*8/10000, 10) / 100;
                        $cn.data.bwTest.self.testDone("testBandwidth");
                        if(!this.testingFinished){
                            BrowseView.bwMessage();
                        }
                        break;
                    case "ProgressUpdate" : // test is still processing - returns percentage complete

                        // Signal an update
                        $cn.data.bwTest.intervalUpdated = true;

                        application.currentView.layoutIsDirty = true;
                        systemBar.setStyle("width",params[1] + '%');
                        timeElapsed = (new Date() - $cn.data.bwTest.self.startTime) / 1000;
                        if (params[1] != 0) {
                            percentLeft = 100 - params[1];
                            secondsPerPercent = timeElapsed / params[1];
                            timeRemaining.innerHTML = Math.ceil(percentLeft * secondsPerPercent);
                        }
                        break;
                    case "SpeedUpdate" :  // test is still processing - returns current bytes/sec
                        // Signal an update
                        $cn.data.bwTest.intervalUpdated = true;
                        $cn.data.bwTest.speedBytes = parseInt(params[1]);
                        break;

                }
            } else {
                // Signal an update
                $cn.data.bwTest.intervalUpdated = true;

                if ($cn.data.bwTest.calls >= 10) {
                    // clearInterval(SpeedInterval);
                    // We are done - add code to close.
                    test = $cn.data.bwTest.self.getTest("testBandwidth");
                    test.result = parseInt($cn.data.bwTest.speedBytes*8/10000, 10) / 100;
                    $cn.data.bwTest.self.testDone("testBandwidth");
                }
                BrowseView.bwMessage();
                application.currentView.layoutIsDirty = true;
                $('SystemStatusBar').setStyle("width",($cn.data.bwTest.calls * 10) + '%');

                $cn.data.bwTest.calls++;

            }
        }
    },
    hide: function() {
        this.parent();
        this.updateHtmlWithResults();
        this.showWarningMarks();
        this.setCorrectFocus();
    },
    updateHtmlWithResults: function() {
        var i,
            test;
        for (i = 0; i < $cn.data.SystemTests.length; ++i) {
            test = $cn.data.SystemTests[i];
            if (test.completed) {
                this.setStringForTest(test, test.result);
            }
        }
    },
    showWarningMarks: function() {
        var test,
            showDetails = false,
            messagePath = application.resource.testing_messages;

        $cn.data.SystemTests.moreDetails = {};
        $cn.data.SystemTests.moreDetails.data = {};
        $cn.data.SystemTests.informativeText = "";

        test = this.getTest("testConnectionType");
        if (test.result === messagePath.connectionType.wireless ||
            test.result === messagePath.connectionType.none) {
            showDetails = true;
            this.makeWarningVisible(test);

            $cn.data.SystemTests.informativeText += messagePath.connectionHeading.replace('##type##',test.result) + messagePath.connectionInfo[test.result] + "<br/><br/>";
        }

        test = this.getTest("testActivationStatus");
        if (test.result === application.resource.testing_messages.notActivated) {
            showDetails = true;
            this.makeWarningVisible(test);

            $cn.data.SystemTests.informativeText += messagePath.activationHeading.replace('##status##', test.result) + messagePath.activationInfo + "<br/><br/>";
        }

        test = this.getTest("testResConnection");
        if (test.result === test.defaultString) {
            showDetails = true;
            this.makeWarningVisible(test);

            $cn.data.SystemTests.informativeText += messagePath.storeHeading.replace('##status##', test.result) + messagePath.storeInfo + "<br/><br/>";
        }

        if (showDetails) {
            $$(".systemstatusresults #results-more-details").setStyle('display', 'inline-block');
        }
    },
    makeWarningVisible: function(test) {
        $$(test.htmlLocation).getNext('span').setStyle('display', 'inline-block');
    },
    setCorrectFocus: function() {
        if($('results-more-details').getStyle('display') !== "none") {
            application.navigator.setFocus("results-more-details");
        } else {
            application.navigator.setFocus("results-test-again");
        }
    }
});
