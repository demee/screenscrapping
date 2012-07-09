/*jslint browser: true, devel: true, node: true, nomen: true, plusplus: true, white: true */
"use strict";

var SCREEN_HEIGHT = 768; 
var SCREEN_WIDTH = 1024; 

//var phantom = require('phanotom').create();

var utils = require('utils');

var casper = require('casper').create({
    verbose: true,
    logLevel: "debug", 
    httpStatusHandlers: {
        404: function(self, resource) {
            this.log("Resource at " + resource.url + " not found (404)", "warning");
        }, 
        500: function(self, resource) {
            this.log("Looks like something went wrong really badly " + resource.url + " (500)", "warning");
        }
    },
    pageSettings: {
        loadImages:  true,        // The WebPage instance used by Casper will
        loadPlugins: true         // use these settings
    }, 
    viewport: {
        width: SCREEN_WIDTH, 
        height: SCREEN_HEIGHT
    }, 
    clientScripts:  [
        'underscore.js'
    ]
});

/* Setting up the events */ 
casper.on('page.error', function (msg, trace){
    this.echo("Error: " + msg, "ERROR");
    utils.dump(trace);
    casper.capture("last_page_errror.png");
});

casper.on('error', function(msg, trace) {   // Any "error" level message will be written
    casper.log('____FATAL____: ' + msg, 'error'); // on the console output and PhantomJS will
    utils.dump('error');
    casper.exit();// terminate
});

/* Helper functions */ 

var _printHelp = function(){
    casper.echo("usage: casper --useranme=<username> --password=<password> --world=<world> [--command=command]"); 
    casper.echo("Other options:"); 
    casper.echo("--help               Displays this screen");
    casper.echo("--debug=true         Turns on debug mode");
    casper.echo("--screenshoots=true  Dumps debug screensots into working directory for each page load"); 
    casper.echo("--list=commands      Prints list of avaliable commands");
}; 

var _log = function(msg, lvl){
    casper.log(msg, lvl || 'info');
}; 

var _debugScreenshoot = function(name){
    casper.capture(name || 'screenshot.png');
};

var _logIn =  function(){

    this.evaluate(function(username, password){
        document.querySelector('input[name=user]').value = username;
        document.querySelector('input[name=password]').value = password;    
    }, {
        username: casper.cli.options.username,
        password: casper.cli.options.password
    });

    this.click('.login_button');
}; 

var _selectWorld = function() {

    var world = casper.cli.options.world;

    this.waitForSelector('#active_server', function(){

        var worldLinkId = this.evaluate(function(world){
            var serverLinks = document.querySelectorAll('#servers-list-block a'); 

            _.each(serverLinks, function(link){
                link.id = _.uniqueId('server_link_');
            });

            var link = _.find(serverLinks, function(x){return x.innerText.indexOf(world) > 0}); 
            return link.id; 
        }, {
            world: casper.cli.options.world
        }); 

        this.click('#' + worldLinkId); 

        this.then(function(){
            _debugScreenshoot('homepage.png');
        })

    }, function(){
        _log('No servers to choose from')
    });
};

var _processCommand = function(){
    var command = commands[casper.cli.options.command]; 
    if(utils.isFunction(command)){
        command();
    } else {
        _log("No such commnd " + casper.cli.options.command, 'error')
    }
}; 

var _exitScript = function(){
    this.log('Program has ended, thank you for using script', 'info');
    this.exit();
};

/* Supported command list, all commands assume that we're looged on the home page */ 

var commands = {
    news: function(unreadOnly){
        _log("Go to news"); 

        casper.then(function(){
            this.click('#menu_row .menu-item:nth-child(3) a'); 
            this.then(function(){
                var messages = this.evaluate(function(){
                    var messagesTexts = []; 
                    var messages = __utils__.getElementsByXPath('//*[@id="content_value"]/table/tbody/tr/td[2]/form/table/tbody/tr[2]/td[1]/a')
                    _.each(messages, function(message){
                        messagesTexts.push(message.innerText);
                    })

                    return messagesTexts;
                }); 

                casper.echo(messages);
            }); 
        });
    }, 
    overview: function(){

    }
};

/* Init script */  
(function(){
    var error = ""; 

    if(!casper.cli.options.username){
        error += "missing username, ";
    }

    if(!casper.cli.options.password){
        error += "missing password, ";
    }

    if(!casper.cli.options.world){
        error += "missing world"
    }

    if(error){
        _log(error, 'erorr');
        _printHelp();
        casper.exit();
    }
}()); 

/* Run casper */ 

casper.start('http://www.plemiona.pl/',_logIn);
casper.then(_selectWorld);
casper.then(_processCommand);
casper.run(_exitScript);






