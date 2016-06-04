var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var htmlparser = require("htmlparser");
var http = require("http");
var cheerio = require('cheerio');
var mongojs = require('mongojs');
var db = mongojs('qwerty:qwerty@40.74.48.227/TestDb', ['Orders2', 'kvartiry']);

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


var rawHtml = "Xyz <script language= javascript>var foo = '<<bar>>';< /  script><!--<!-- Waah! -- -->";
http.get('http://olx.ua/i2/nedvizhimost/arenda-kvartir/dolgosrochnaya-arenda-kvartir/kiev/?page=1', function (res) {
    //console.log('STATUS: ' + res.statusCode);
    //console.log('HEADERS: ' + JSON.stringify(res.headers));

    // Buffer the body entirely for processing as a whole.
    var bodyChunks = [];
    res.on('data', function (chunk) {
        // You can process streamed parts here...
        bodyChunks.push(chunk);
    }).on('end', function () {
        var body = Buffer.concat(bodyChunks);
        $ = cheerio.load(body);

        //var notPromoted = $("li.item").not('.promoted');
        var notPromoted = $("li.item").not('.promoted');
        //console.log('not promoted: ' + notPromoted[0]);

        for (var i in notPromoted) {
            if (i < notPromoted.length) {
                //        console.log(notPromoted[0])
                var dataNinja = notPromoted[i].attribs['data-ninja']
                var price = notPromoted[i].children[0].next.children[0].next.children[0].next.children[5].children[1].children[0].data.trim();
                console.log('price: ' + price);
                var title = notPromoted[i].children[0].next.children[0].next.children[0].next.children[5].children[7].children[0].data.trim();
                console.log('title: ' + title);
                //console.log(i + ' ' + dataNinja);s
                var dataNinjaJson = JSON.parse(unescape(dataNinja))
                //console.log(i + ' ' + dataNinjaJson);
                console.log(dataNinjaJson.creationDate);
                console.log()
                db.kvartiry.insert({price: price, title: title, date: dataNinjaJson.creationDate}, function(err, docs){
                });
            }
        }
        db.kvartiry.find({}, function(err, docs){
            console.log(docs);
        });

        //var flats = $('.titlebox');
        //for (var i in flats) {
        //    if (i < flats.length) {
        //                console.log(flats[0]);
        //        console.log('======================= # ' + i + ' ==========================');
        //        console.log($('.titlebox .price')[i].children[0].data.trim());
        //        console.log($('.titlebox .title')[i].children[0].data.trim());
        //        console.log($('.titlebox .date')[i].children[0].data.trim());
        //    }
        //    //console.log(flats[0].children[0]);
        //}
        //console.log();
        //console.log('' + body);

        //console.log($('.titlebox > .price').text());

        //var handler = new htmlparser.DefaultHandler(function (error, dom) {
        //    if (error)
        //        console.log(error);
        //    else
        //        console.log('parsing done');
        //});
        //var parser = new htmlparser.Parser(handler);
        //parser.parseComplete(body);
        //console.log(handler.dom[3].children[1]);
        //console.log('BODY: "' + body + '"');
        // ...and/or process the entire body here.
    })
});

//var handler = new htmlparser.DefaultHandler(function (error, dom) {
//    if (error)
//        console.log(error);
//    else
//        console.log('parsing done');
//});
//var parser = new htmlparser.Parser(handler);
//parser.parseComplete(rawHtml);
//console.log(handler.dom);


module.exports = app;