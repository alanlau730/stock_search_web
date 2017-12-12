var express = require("express");
var app = express();
var morgan = require("morgan");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var path = require("path");
//var http = require("http");	
const request = require("request");
//const rp = require("request-promise");
var momentTZ = require("moment-timezone");
var moment = require("moment");
var convert = require("xml2json");
var jsonp = require("node-jsonp");


var autocompleteURL = "http://dev.markitondemand.com/MODApis/Api/v2/Lookup/json?input=";
var surlOne = "http://www.alphavantage.co/query?function=";
var timefunc = "TIME_SERIES_DAILY";
var surlTwo = "&symbol=";
//var surlTimeThree = "&apikey=";//+API_KEY;
var surlThree = "&interval=daily&time_period=10&series_type=closed&apikey=";
var func = "SMA";
var symbol = "MSFT";
var API_KEY = "SIAUUWA6582MZ8H4";
var historyURL = "http://www.highcharts.com/samples/data/jsonp.php?filename=";
var historyURLEnd = "-c.json&callback=?";

var newsURL = "http://seekingalpha.com/api/sa/combined/";
var newsURLEnd = ".xml";

var historyURL = "http://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=";
var historyURLEnd = "&outputsize=full&apikey=SIAUUWA6582MZ8H4";

//var xmlParser = new DOMParser();

//symbolURL is surlOne+func+surlTwo+symbol+surlThree+API_KEY
//autocompleteURL is autoOne+symbol
//SYMBOLS: Price (NOT ACTUALLY A SYMBOL), SMA, EMA, STOCH, RSI, ADX, CCI, BBANDS , MACD
//Stock Details: Stock Ticker Symbol, Last Price, Change (Change Percent), Timestamp, Open, Close, Day's Range, Volume


//look up how to change the html in a div with angular + node

app.use(express.static(__dirname));
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({"extended":'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({type: "application/vnd.api+json"}));
app.use(methodOverride());

//enable cors
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});


//show the main page of the application
app.get("/",function(req,res){
	console.log("Node got your message.");
	res.sendFile(path.join(__dirname+"/hw8.html"));
});

//for the autocomplete request
app.get("/autocomplete",function(req,res){
	var symbol = req.url.substr((req.url).search("=")+1);
	//console.log(req.url + " url " + symbol + " SYMBOL ");
	//console.log("You want to autocomplete eh?");
	
	
	
	
	request(autocompleteURL+symbol, function (error, response, body) {
	/*console.log('error:', error); // Print the error if one occurred
	console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
	console.log('body:', body); // Print the HTML for the Google homepage.
	console.log(typeof(body) +" AUTO BODY TYPE ");
	*/
	//console.log(body + " AUTO BODY ");
	var bodyJSON = JSON.parse(body);
	//console.log(typeof(bodyJSON) + " AUTO BODY JSON ");
		res.send(bodyJSON);
	});
});

//for quote info
app.get("/quote",function(req,res){
	var sym = req.url.substr((req.url).search("=")+1);
	//console.log("QUOTE SYM " + sym);
	var httpURL = surlOne+timefunc+surlTwo+sym+surlThree+API_KEY;
	
	
	/* error message examples
	  {
    "Error Message": "Invalid API call. Please retry or visit the documentation (https://www.alphavantage.co/documentation/) for TIME_SERIES_DAILY."
	  }
	  
	  {
		  "Information": "wtv"
	  }
	  
	*/
	
	
	
	request(httpURL, function (error, response, body) {
	//console.log("WUTS MY JSON");
	//console.log(body);
	//console.log(body + " quote body ");
	var bodyJSON = JSON.parse(body);
	//console.log(bodyJSON["Error Message"]);
	//console.log(bodyJSON["Meta Data"]["1: Symbol"] + " BODY JSON meta data ");
	if(bodyJSON.length==0 || bodyJSON == null || "Error Message" in bodyJSON || "Information" in bodyJSON)
	{//our request failed
		res.status(404).send("API Call failed");
	}
	else{
		var timeStamp = momentTZ().tz("America/New_York").format();
		var date = timeStamp.substring(0,timeStamp.search("T"));
		var tempStr = timeStamp.substr(timeStamp.search("T")+1);
		var currTime = tempStr.substr(0,tempStr.search("-"));
		var afterHrs = currTime > "16:00:00";
		
		if(afterHrs){
			currTime = "16:00:00";		
		}
		
		//console.log(date + " DATE ");
		//console.log(currTime + " CURR TIME ");
		//console.log(timeStamp + " TIME STAMP ");
		timeStamp = date + " " + currTime + " EDT ";
		bodyJSON["TimeStamp"] = timeStamp;
		//console.log("QUOTE URL " +httpURL);
			res.send(bodyJSON);
	}
		});
	
	});



app.get("/quoteRefresh",function(req,res){//finish this when u wake up

	/*alert(req.url + " REFRESH URL ");
	var sym = req.url.substring(req.url.search("=")+1,req.url.search("%"));
	var searchIdx = req.url.substr(req.url.search("%")+3);
	*/
	
	var testing = req.url;
	var searchIdx = parseInt(testing.substring(testing.search("searchIdx")+10,testing.search("&")));
	var sym = testing.substr(testing.search("searchSymbol")+13);
	

	var httpURL = surlOne+timefunc+surlTwo+sym+surlThree+API_KEY;
	//alert(httpURL + " REFRESH HTTP URL ");
	
	request(httpURL, function (error, response, body) {
	//console.log(body + " quote body ");
	var bodyJSON = JSON.parse(body);
	//console.log(bodyJSON["Meta Data"]["1: Symbol"] + " BODY JSON meta data ");
	
	if(bodyJSON == null || bodyJSON.length == 0 || "Error Message" in bodyJSON || "Information" in bodyJSON)
	{//our request failed
		res.status(404).send("API Call failed");
	}
	
		else{var timeStamp = momentTZ().tz("America/New_York").format();
		var date = timeStamp.substring(0,timeStamp.search("T"));
		var tempStr = timeStamp.substr(timeStamp.search("T")+1);
		var currTime = tempStr.substr(0,tempStr.search("-"));
		var afterHrs = currTime > "16:00:00";
		
		if(afterHrs){
			currTime = "16:00:00";		
		}
		
		//console.log(date + " DATE ");
		//console.log(currTime + " CURR TIME ");
		//console.log(timeStamp + " TIME STAMP ");
		timeStamp = date + " " + currTime + " EDT ";
		bodyJSON["SEARCHIDX"] = searchIdx;
		bodyJSON["TimeStamp"] = timeStamp;
		//console.log("QUOTE URL " +httpURL);
			res.send(bodyJSON);
		}
		}
	);
	
});





//indicators
app.get("/sma",function(req,res){//finish this when u wake up
	var sym = req.url.substr((req.url).search("=")+1);
	var httpURL = surlOne+"SMA"+surlTwo+sym+surlThree+API_KEY;
	
	
	
	
	
	request(httpURL, function (error, response, body) {
	//console.log("BODY: " + body);
    var bodyJSON = JSON.parse(body);
	
	//console.log(bodyJSON["Meta Data"]["1: Symbol"] + " BODY JSON meta data ");
	if(bodyJSON == null || bodyJSON.length == 0 || "Error Message" in bodyJSON || "Information" in bodyJSON)
	{//our request failed
		res.status(404).send("API Call failed");
	}
	
	else{
	
		res.send(bodyJSON);
	}
	});
});


app.get("/ema",function(req,res){//finish this when u wake up
	var sym = req.url.substr((req.url).search("=")+1);
	var httpURL = surlOne+"EMA"+surlTwo+sym+surlThree+API_KEY;
	//console.log(sym + " SYM " + 
	
	request(httpURL, function (error, response, body) {
	//console.log("BODY: " + body);
    var bodyJSON = JSON.parse(body);
	
	if(bodyJSON == null || bodyJSON.length == 0 || "Error Message" in bodyJSON || "Information" in bodyJSON)
	{//our request failed
		res.status(404).send("API Call failed");
	}
	
	
	else{res.send(bodyJSON);}
	});
});

app.get("/stoch",function(req,res){//finish this when u wake up
	var sym = req.url.substr((req.url).search("=")+1);
	var httpURL = surlOne+"STOCH"+surlTwo+sym+surlThree+API_KEY;
	//console.log(sym + " SYM " + 
	
	request(httpURL, function (error, response, body) {
	//console.log("BODY: " + body);
    var bodyJSON = JSON.parse(body);
	if(bodyJSON == null || bodyJSON.length == 0 || "Error Message" in bodyJSON || "Information" in bodyJSON)
	{//our request failed
		res.status(404).send("API Call failed");
	}
	
	else{res.send(bodyJSON);}
	});
});

app.get("/rsi",function(req,res){//finish this when u wake up
	var sym = req.url.substr((req.url).search("=")+1);
	var httpURL = surlOne+"RSI"+surlTwo+sym+surlThree+API_KEY;
	//console.log(sym + " SYM " + 
	
	request(httpURL, function (error, response, body) {
	//console.log("BODY: " + body);
    var bodyJSON = JSON.parse(body);
	if(bodyJSON == null || bodyJSON.length == 0 || "Error Message" in bodyJSON || "Information" in bodyJSON)
	{//our request failed
		res.status(404).send("API Call failed");
	}
	
	else{res.send(bodyJSON);}
	
	});
});

app.get("/adx",function(req,res){//finish this when u wake up
	var sym = req.url.substr((req.url).search("=")+1);
	var httpURL = surlOne+"ADX"+surlTwo+sym+surlThree+API_KEY;
	//console.log(sym + " SYM " + 
	
	request(httpURL, function (error, response, body) {
	//console.log("BODY: " + body);
    var bodyJSON = JSON.parse(body);
	if(bodyJSON == null || bodyJSON.length == 0 || "Error Message" in bodyJSON || "Information" in bodyJSON)
	{//our request failed
		res.status(404).send("API Call failed");
	}
	
	else{res.send(bodyJSON);}
	});
});

app.get("/cci",function(req,res){//finish this when u wake up
	var sym = req.url.substr((req.url).search("=")+1);
	var httpURL = surlOne+"CCI"+surlTwo+sym+surlThree+API_KEY;
	//console.log(sym + " SYM " + 
	
	request(httpURL, function (error, response, body) {
	//console.log("BODY: " + body);
    var bodyJSON = JSON.parse(body);
	
	if(bodyJSON == null || bodyJSON.length == 0 || "Error Message" in bodyJSON || "Information" in bodyJSON)
	{//our request failed
		res.status(404).send("API Call failed");
	}
	
	else{	res.send(bodyJSON);}
	
	});
});

app.get("/bbands",function(req,res){//finish this when u wake up
	var sym = req.url.substr((req.url).search("=")+1);
	var httpURL = surlOne+"BBANDS"+surlTwo+sym+surlThree+API_KEY;
	//console.log(sym + " SYM " + 
	
	request(httpURL, function (error, response, body) {
	//console.log("BODY: " + body);
    var bodyJSON = JSON.parse(body);
	
	if(bodyJSON == null || bodyJSON.length == 0 || "Error Message" in bodyJSON || "Information" in bodyJSON)
	{//our request failed
		res.status(404).send("API Call failed");
	}
	
	else{res.send(bodyJSON);}
	
	});
});

app.get("/macd",function(req,res){//finish this when u wake up
	var sym = req.url.substr((req.url).search("=")+1);
	var httpURL = surlOne+"MACD"+surlTwo+sym+surlThree+API_KEY;
	//console.log(sym + " SYM " + 
	
	request(httpURL, function (error, response, body) {
	//console.log("BODY: " + body);
    var bodyJSON = JSON.parse(body);
	
	if(bodyJSON == null || bodyJSON.length == 0 || "Error Message" in bodyJSON || "Information" in bodyJSON)
	{//our request failed
		res.status(404).send("API Call failed");
	}
	
	else{res.send(bodyJSON);}
	});
});



app.get("/news",function(req,res){//finish this when u wake up
	var sym = req.url.substr((req.url).search("=")+1);
	var httpURL = newsURL+sym+newsURLEnd;
	//console.log(sym + " SYM " + 
	
	request(httpURL, function (error, response, body) {
	//console.log("BODY: " + body);
	//console.log(typeof(body) + " BODY TYPE");
	//var xml = xmlParser.parseFromString(body,"text/html");
	//var xmlItems = xml.getElementsByTagName("item");
	//console.log(xmlItems + " XML ITEMS ");
	
	//console.log(body + "    !!XML!!");
	try{
    var xmlToJSON = convert.toJson(body,{
		object: true,
		reversible:true,
		coerce:false,
		sanitize:true,
		trim:true	
	});	
	}
	catch(e){
		res.status(404).send("XML IS NOT WELL FORMED");
	}
	//console.log(xmlToJSON + " XML TO JSON");
	res.send(xmlToJSON);
	});
});


app.get("/history",function(req,res)
{
	var sym = req.url.substr((req.url).search("=")+1);
	var httpURL = historyURL+sym+historyURLEnd;
	//console.log(sym + " SYM " + 
	//console.log("IS THIS THE CORRECT HTTPURL: " + httpURL);
	/*request(httpURL, function (error, response, body) {
		console.log("HISTORY BODY : ");
		console.log("BODY");
	});*/
	
	//at most we will have 1000 data items
	/*jsonp(httpURL,function(json){
		//console.log("DID I GET IT");
		//console.log(JSON.stringify(json));
		res.send(json);
	});*/
	request(httpURL, function (error, response, body) {
		
		var bodyJSON = JSON.parse(body);
		
		if(bodyJSON == null || bodyJSON.length == 0 || "Error Message" in bodyJSON || "Information" in bodyJSON)
		{//our request failed
			res.status(404).send("API Call failed");
		}
		
		else{res.send(bodyJSON);}
	
	});
	
});

app.post("http://export.highcharts.com/facebook",function(req,res)
{
	var httpURL = 'https://export.highcharts.com/';
	console.log(req + " REQ ");
	console.log(res + " RES ");
	
	/*request(httpURL, function (error, response, body) {
		console.log(body + " WHAT IS THIS BODY");
		var bodyJSON = JSON.parse(body);
		res.send(bodyJSON);
		/*
		if(bodyJSON == null || bodyJSON.length == 0 || "Error Message" in bodyJSON || "Information" in bodyJSON)
		{//our request failed
			res.status(404).send("API Call failed");
		}
		
		else{res.send(bodyJSON);}
	
	});*/
});





app.listen(8080);

//this should show the html file
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


//route for angular
/*app.get("*",function(req,res){
	res.sendfile("./hw8.html");	
});*/


//original code in amazon sample
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
