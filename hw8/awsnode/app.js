/*var http = require('http');
var fs = require('fs');

const PORT=8080; 

fs.readFile('./hw8.html', function (err, html) {

    if (err) throw err;    

    http.createServer(function(request, response) {  
        response.writeHeader(200, {"Content-Type": "text/html"});  
        response.write(html);  
        response.end();  
    }).listen(PORT);
});*/

/*var express = require("express");
var app = express();
var morgan = require("morgan");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var path = require("path");

app.use(express.static(__dirname));
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({"extended":'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({type: "application/vnd.api+json"}));
app.use(methodOverride());

console.log("App listening on port 8080");
console.log(__dirname + " DIR NAME ");

//route for get request
app.get("/",function(req,res){
	console.log("Node got your message.");
	//res.send("Hello World!");
});

app.listen(8080);
*/


//route for angular
/*app.get("*",function(req,res){
	res.sendfile("./hw8.html");	
});*/

//original code in sample
/*var port = process.env.PORT || 3000,
    http = require('http'),
    fs = require('fs'),
    html = fs.readFileSync('index.html');

var log = function(entry) {
    fs.appendFileSync('/tmp/sample-app.log', new Date().toISOString() + ' - ' + entry + '\n');
};

var server = http.createServer(function (req, res) {
    if (req.method === 'POST') {
        var body = '';

        req.on('data', function(chunk) {
            body += chunk;
        });

        req.on('end', function() {
            if (req.url === '/') {
                log('Received message: ' + body);
            } else if (req.url = '/scheduled') {
                log('Received task ' + req.headers['x-aws-sqsd-taskname'] + ' scheduled at ' + req.headers['x-aws-sqsd-scheduled-at']);
            }

            res.writeHead(200, 'OK', {'Content-Type': 'text/plain'});
            res.end();
        });
    } else {
        res.writeHead(200);
        res.write(html);
        res.end();
    }
});

// Listen on port 3000, IP defaults to 127.0.0.1
server.listen(port);

// Put a friendly message on the terminal
console.log('Server running at http://127.0.0.1:' + port + '/');
*/