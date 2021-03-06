var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var redis = require('redis');
var parseRedisUrl = require('parse-redis-url')(redis);
var kue = require('kue');


var port = process.env.PORT || 3000;

var jobs = kue.createQueue({redis: parseRedisUrl.parse(process.env.REDIS_URL)});

var jsonParser = bodyParser.json();


app.head('/hooks/mandrill/', function(req, res) {
    console.log('HEAD', req.body);
    res.send('');
});

app.post('/hooks/mandrill/', jsonParser, function(req, res) {
    console.log('POST', req.body);

    req.body.mandrill_events.forEach(function (msg) {
        if (msg.event != 'inbound') {
            console.log('unexpected event type: %s', msg.event);
            return;
        }
        var job = jobs.create('mandrill', msg
            ).save(function(err) {
                if (!err) {
                    console.log(job.id);
                }
            });
    });
    res.send('');
});


var server = app.listen(port, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('mailin listening at %s:%s', host, port);

});
