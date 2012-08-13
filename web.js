var express = require('express'),
    NODE_MEMORY_LIMIT = 475,
    LOG_FORMAT = ':method :url :status - :response-time ms - :user-agent';

var app = express(),
    port = process.env.PORT || 11115;

app.listen(port, function(){ console.log("Listening on " + port); });

app.use(express.logger(LOG_FORMAT));
app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser());

app.get('/favicon.ico', function(req, res) { res.redirect('/images/favicon.png'); });

setInterval(function() {
    if (Math.round(process.memoryUsage().rss / 1024 / 1024) > NODE_MEMORY_LIMIT)
        process.exit();
}, 5000);