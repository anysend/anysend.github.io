var express = require('express'),

    Mailchimp = require('mailchimp').MailChimpAPI,

    MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY,
    NODE_MEMORY_LIMIT = 475,
    LOG_FORMAT = ':method :url :status - :response-time ms - :user-agent';

var app = express(),
    port = process.env.PORT || 11115;

app.listen(port, function(){ console.log("Listening on " + port); });

app.use(express.logger(LOG_FORMAT));
app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser());

app.get('/favicon.ico', function(req, res) { res.redirect('/images/favicon.png'); });
app.post('/interested_in/:version', function(req, res) {
    try { var api = new Mailchimp(MAILCHIMP_API_KEY, {version: '1.3', secure: false}); }
    catch (e) { return res.send(500, e); }

    api.lists(function(err, r) {
        if (err || !r.data || !Array.isArray(r.data)) return res.send(500, err);

        var list = r.data.filter(function(l) {
            return l && l.name && l.name.toLowerCase().indexOf('anysend') !== -1 && 
                l.name.toLowerCase().indexOf(req.param('version')) !== -1;
        });

        if (!list.length) return res.send(404, 'no valid list found');

        list = list[0];

        api.listSubscribe({
            id: list.id,
            double_optin: false,
            email_address: req.param('email')
        },
        function(err, subscribeResponse) {
            if (err) return res.send(500, err);

            console.log(subscribeResponse);

            res.send(201);
        });
    });
});

setInterval(function() {
    if (Math.round(process.memoryUsage().rss / 1024 / 1024) > NODE_MEMORY_LIMIT)
        process.exit();
}, 5000);