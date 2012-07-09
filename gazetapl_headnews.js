var page = require('webpage').create();

 page.open('http://www.gazeta.pl', function (status) {
    if (status === 'fail') {
        console.log('Page did not load');
    } else {
        var title = page.evaluate(function () {
            return document.querySelector('.maintopicHP a').innerText
        });

        console.log(title);

        phantom.exit();
    }
});