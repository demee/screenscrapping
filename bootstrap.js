var SCREEN_HEIGHT = 768; 
var SCREEN_WIDTH = 1024; 

//var phantom = require('phanotom').create();

var casper = require('casper').create({
    verbose: true,
    logLevel: "debug", 
    onError: function(self, m) {   // Any "error" level message will be written
        console.log('FATAL:' + m); // on the console output and PhantomJS will
        self.exit();               // terminate
    }, 
    pageSettings: {
        loadImages:  true,        // The WebPage instance used by Casper will
        loadPlugins: true         // use these settings
    }, 
    viewport: {
        width: SCREEN_WIDTH, 
        height: SCREEN_HEIGHT
    }
});

var _log = function(msg, lvl){
    casper.log(msg, lvl || 'info')
}; 


var _debugScreenshoot = function(name){
    casper.capture(name);
}
