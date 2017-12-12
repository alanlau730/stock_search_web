//COME BACK AND MAKE FINAL TOUCHES TO GRAPHS LATER
//should i load the charts everytime i click a tab or only when i make a new query
//may make fb request incorporated node but the assignment only says alpha vantage needs node so  i think im good

(function () {
  'use strict';
  angular
      .module('MyApp', ['ngAnimate','ngTouch','ngMaterial', 'ngMessages'])
      .controller('DemoCtrl', DemoCtrl);

  function DemoCtrl ($scope,$http,$timeout, $q) {
    var self = this;

    // list of `state` value/display objects
    self.states      = loadAll();
    self.selectedItem  = null;
    self.searchText    = null;
	self.currSymbol = "";
	self.loadedQuotes = false;
    //self.querySearch   = querySearch;
	self.stocks = [];
	self.quotes = {};//also doubles as having price information
	self.quotesWait = true;
	self.quotesFail = false;
	
	//other indicators
	self.sma = {};
	self.ema = {};
	self.stoch = {};
	self.rsi = {};
	self.adx = {};
	self.cci = {};
	self.bbands = {};
	self.macd = {};
	self.favorites = {};//a map of favorite key value pairs 
	self.favorites.size = 0;
	self.favoritesArray = [];
	//self.favoritesArray = [];
	//self.history = {};
	
	//for the charts themselves
	self.priceChart = {};
	self.smaChart = {};
	self.emaChart = {};
	self.stochChart = {};
	self.rsiChart = {};
	self.adxChart = {};
	self.cciChart = {};
	self.bbandsChart = {};
	self.macdChart = {};
	self.chartToDisplay = {};
	
	self.exportChart = {};
	self.exportPriceChart = {};
	self.exportsmaChart = {};
	self.exportemaChart = {};
	self.exportstochChart = {};
	self.exportrsiChart = {};
	self.exportadxChart = {};
	self.exportcciChart = {};
	self.exportbbandsChart = {};
	self.exportmacdChart = {};
	
	//self.quotesWait = true;
	self.recentQuote = {};
	self.prevRecentQuote = {};
	self.priceChangeVal = Number.MIN_VALUE;
	self.percentChange = "";
	self.timeStamp = "";
	self.closePrice = "";
	//self.lastPrice = "";
	self.smaWait = true;
	self.emaWait = true;
	self.stochWait = true;
	self.rsiWait = true;
	self.adxWait = true;
	self.cciWait = true;
	self.bbandsWait = true;
	self.macdWait = true;
	self.newsWait = true;
	self.historyWait = true;
	//self.historyWait = true;
	//for the pages
	
	self.showingFavorites = true;
	//if true show favorites, if false show stock details
	//self.showingStockDetails = false;
	
	
	self.smaFail = false;
	self.emaFail = false;
	self.stochFail = false;
	self.rsiFail = false;
	self.adxFail = false;
	self.cciFail = false;
	self.bbandsFail = false;
	self.macdFail = false;
	self.newsFail = false;
	self.historyFail = false;
	
	
	
	
	
	//for the favorites list sorting options
	self.favoritesSortOptions = ["Default","Symbol","Stock Price","Change", "Change (Change Percent)","Volume"];
	self.favoritesSortOrder = ["Ascending","Descending"];
	//bleh just give them some default values
	self.SortFieldFilter = "Order";
	self.SortOrderFilter = false;
	self.sortFilterMap = {"Default":"Order","Symbol":"Symbol","Stock Price":"Stock Price", "Change":"Stock Price Change Val","Change (Change Percent)":"Stock Price Change Percent",
	"Volume":"Volume","Ascending":false,"Descending":true};//map the menu text to an angular acceptable filter
	
	const NUM_WEEKS = 25;
	const NUM_WORKDAYS = 5;
	const TOTAL_WORKDAYS = NUM_WEEKS * NUM_WORKDAYS;
	
	self.toggleCheck = false;//it's off by default
	
	self.toggleFavorites = function toggleFavorites(){
		if(self.loadedQuotes){
			//console.log(self.showFavorites + " FAVORITES BEFORE TOGGLE ");
			self.showingFavorites = !self.showingFavorites;	
			//console.log(self.showFavorites + " FAV AFTER TOGGLE ");
		}
		
	}

    // ******************************
    // Internal methods
    // ******************************
	
	/*
	//some functions to implement sliding
	self.ngIncludeTemplates = [{ index: 0, name: 'favorites', url: 'favorites.html' }, { index: 1, name: 'stockdetails', url: 'stockdetails.html' }];
	//self.ngIncludeSelected = {};
    self.selectPage = selectPage;
	self.moveToLeft = true;
	//initially we show favorites
    self.ngIncludeSelected = self.ngIncludeTemplates[0];
	//self.moveToLeft = true;
	console.log("move to left? " + self.moveToLeft);

    function selectPage(indexSelected) 
	{
		console.log(self.loadedQuotes + " ARE QUOTES LOADED ");
		console.log(self.moveToLeft + " MOVE TO LEFT RN??? ");
	  if(indexSelected == 1 && !self.loadedQuotes){//do nothing if we want to show stock details and quotes haven't been loaded yet
		  console.log("CAN'T MOVE YET ");
	  }
	  
	  else{
        if (indexSelected == 1) {
            self.moveToLeft = false;
			console.log("ASSIGNED MOVE LEFT TO FALSE");
        } else {
            self.moveToLeft = true;
			console.log("ASSIGNED MOVE TO LEFT TO TRUE");
        }
		self.moveToLeft = !self.moveToLeft;
        self.ngIncludeSelected = self.ngIncludeTemplates[indexSelected];
		console.log(self.moveToLeft + " MOVE TO LEFT STATUS");
		console.log(self.ngIncludeSelected.url + " CHANGE TO THIS PAGE ");
	  }
    }*/
	//done with sliding stuff
	
	/*
	self.showFavorites = function showFavorites()//default..show this after you click the clear button
	{
		console.log("SHOWING FAVORITES");
		self.showingFavorites = true;
		self.showingStockDetails = false;
	}
	
	self.showStockDetails = function showStockDetails()
	{
		if(!self.loadedQuotes){//don't do anything if quote info hasn't already loaded
			
			console.log("SHOWING STOCK DETAILS");
			self.showingStockDetails = true;
			self.showingFavorites = false;
		}
		else{
			console.log("QUOTES STILL LOADING SO CAN't SHOW IT yet");
		}
	}
	*/
	
	self.resetVariables = function resetVariables()
	{
		self.selectedItem = null;
		self.searchText    = null;
		self.currSymbol = "";
		self.loadedQuotes = false;
		//self.querySearch   = querySearch;
		self.stocks = [];
		self.quotes = {};//also doubles as having price information
		//other indicators
		self.sma = {};
		self.ema = {};
		self.stoch = {};
		self.rsi = {};
		self.adx = {};
		self.cci = {};
		self.bbands = {};
		self.macd = {};
		//self.history = {};
		
		self.quotesWait = true;
		self.smaWait = true;
		self.emaWait = true;
		self.stochWait = true;
		self.rsiWait = true;
		self.adxWait = true;
		self.cciWait = true;
		self.bbandsWait = true;
		self.macdWait = true;
		self.historyWait = true;
		self.newsWait = true;
		self.showingFavorites = true;
		
		
		self.quotesFail = false;
		self.smaFail = false;
		self.emaFail = false;
		self.stochFail = false;
		self.rsiFail = false;
		self.adxFail = false;
		self.cciFail = false;
		self.bbandsFail = false;
		self.macdFail = false;
		self.newsFail = false;
		self.historyFail = false;
		
		self.recentQuote = {};
		self.prevRecentQuote = {};
		self.percentChange = "";
		self.priceChangeVal = Number.MIN_VALUE;
		self.timeStamp = "";
		self.closePrice = "";
		//self.lastPrice = "";
		
		//showFavorites();//show favorites lol
		//get rid of it if it poses a problem later
		self.priceChart = {};
		self.smaChart = {};
		self.emaChart = {};
		self.stochChart = {};
		self.rsiChart = {};
		self.adxChart = {};
		self.cciChart = {};
		self.bbandsChart = {};
		self.macdChart = {};
		self.chartToDisplay = {};
		
		self.exportChart = {};
		self.exportPriceChart = {};
		self.exportsmaChart = {};
		self.exportemaChart = {};
		self.exportstochChart = {};
		self.exportrsiChart = {};
		self.exportadxChart = {};
		self.exportcciChart = {};
		self.exportbbandsChart = {};
		self.exportmacdChart = {};
		//self.chartContainerDisplay = {};
		
		
	}
	
	self.autoRefresh = function autoRefresh()
	{

		/*if($scope.checked)
		{
			console.log("it is on");
		}
		else
		{
			console.log("it is off");
		}
		*/
	}
	
	//hacky but wtvs, look into this again in a bit
	self.manualRefresh = function manualRefresh()//try this again on a weekday :(
	{//get stock info huh... but only update the favorites table not the rest of the charts and stuff
		//loop through all of stocks in the array
		
		//timing is off and idx doesn't get called on time so redesign this :(
		
		/*
		var testing = "/quoteRefresh?searchIdx=0&searchSymbol=AAPL";
		var searchIdx = testing.substring(testing.search("searchIdx")+10,testing.search("&"));
		var searchSymbol = testing.substr(testing.search("searchSymbol")+13);
		console.log("SEARCHIDX: " + searchIdx);
		console.log("SEARCHSYMBOL: "+searchSymbol);
		*/
		console.log("I SHOULD've REFRESHED");
		
		for(var idx=0;idx<self.favoritesArray.length;++idx)
		{
			var searchSymbol = self.favoritesArray[idx]["Symbol"];
			var searchIdx = idx;
			//console.log(searchSymbol + " AM I SEARCHING FOR THE CORRECT SYMBOL ");
			$http({
				url:"/quoteRefresh",
				method:"GET",
				params:{searchSymbol,searchIdx}
			}).then(function(response)
			{//success
				var refreshResponse = response.data;				
				var timeSeriesData = response.data["Time Series (Daily)"];
				//var searchIdx = reseponse.data["SEARCHIDX"];
				var count = 0;
				var refreshRecentQuote = {};
				var refreshPrevRecentQuote = {};
				
				for(var entry in timeSeriesData){
					if(count >= 2){
						break;
					}
					++count;
					if(count == 1){
						refreshRecentQuote = timeSeriesData[entry];
					}
					
					if(count == 2){
						refreshPrevRecentQuote = timeSeriesData[entry];
					}
				}
				
				var percentChangeVal = (((parseFloat(refreshRecentQuote["4. close"])-parseFloat(refreshPrevRecentQuote["4. close"]))
				/(parseFloat(refreshPrevRecentQuote["4. close"]))*100)).toFixed(2);
				var changeVal = (parseFloat(refreshRecentQuote["4. close"])-parseFloat(refreshPrevRecentQuote["4. close"])).toFixed(2);
				var percentChange = changeVal + " ("+percentChangeVal + "%)";
				var priceChangeVal = changeVal;
				//self.lastPrice = parseFloat(self.recentQuote["4. close"]).toFixed(2)+"";
				
				var timeStamp = response.data["TimeStamp"];
				var currHr = parseInt(timeStamp.substring(timeStamp.search(" "),timeStamp.search(":")));
				//console.log(currHr + " CURR HR ");
				var closePrice = refreshPrevRecentQuote["4. close"];
				if(currHr >= 16){//if it's past four
					//console.log(" ITS CURR OBJ NOW ");
					closePrice = refreshRecentQuote["4. close"];
				}
				
				//update array fields'
				//come back here if fields contradict this could make a bug
				
				var searchIdx = response.data["SEARCHIDX"];
				//console.log(searchIdx + " IDX VAL " + typeof(searchIdx) + " IDX TYPE");
				
				self.favoritesArray[searchIdx]["Stock Price"] = parseFloat(refreshRecentQuote['4. close']);
				self.favoritesArray[searchIdx]["Stock Price Change Val"] = priceChangeVal;
				self.favoritesArray[searchIdx]["Stock Price Change Percent"] = percentChange;
				self.favoritesArray[searchIdx]["Volume"] = parseInt(refreshRecentQuote['5. volume']);
				console.log("OK SHOULD've REFRESHED THE FIELDS");
			},
			function(response){
				console.log("Refreshing doesn't work lmao");
			}
			
			);
		}
	}
	
	self.deleteFavorite = function deleteFavorite(stockKey)
	{//remove favorite in the array and in the favorites object
		if(self.favorites.size > 0){
			var deleteEntry = self.favorites[stockKey];
			var delIdx = -1;
			for(var idx=0;idx<self.favorites.size;++idx)
			{
				if(self.favoritesArray[idx] === deleteEntry){
					delIdx = idx;
					break;
				}
				
			}
			
			if(delIdx > -1){
				
				self.favoritesArray.splice(delIdx,1);
				delete self.favorites[stockKey];
				self.favorites.size -=1;
			}
		}
		
	}
	
	self.postToFacebook = function postToFacebook()
	{
		//allow user to log in first if not already logged in
		FB.getLoginStatus(function(response) {
		  if (response.status === 'connected') {
			console.log('Logged in.');
		  }
		  else {
			FB.login();
		  }
		});
		//screw it just use dom
		var chartList = document.getElementById("chartTabs");
		var displayChartType = "";
		for(var i=0;i<chartList.children.length;++i)
		{
			if(chartList.children[i].className == "active")//the active tab
			{
				displayChartType = chartList.children[i].children[0].innerText;
				break;
				
			}
			
		}
		
		
		if(displayChartType == "Price")
		{
			self.chartToDisplay = self.priceChart;
			self.exportChart = self.exportPriceChart;
		}
		
		else if(displayChartType == "SMA")
		{
			self.chartToDisplay = self.smaChart;
			self.exportChart = self.exportsmaChart;
		}
		
		else if(displayChartType == "EMA" )
		{
			self.chartToDisplay = self.emaChart;
			self.exportChart = self.exportemaChart;
		}
		
		else if(displayChartType == "STOCH")
		{
			self.chartToDisplay = self.stochChart;
			self.exportChart = self.exportsmaChart;
		}
		
		else if(displayChartType == "RSI")
		{
			self.chartToDisplay = self.rsiChart;
			self.exportChart = self.exportrsiChart;
		}
		
		else if(displayChartType == "ADX")
		{
			self.chartToDisplay = self.adxChart;
			self.exportChart = self.exportadxChart;
		}
		
		else if(displayChartType == "CCI")
		{
			self.chartToDisplay = self.cciChart;
			self.exportChart = self.exportcciChart;
		}
		
		else if(displayChartType == "BBANDS")
		{
			self.chartToDisplay = self.bbandsChart;
			self.exportChart = self.exportbbandsChart;
		}
		
		else//if it's macd
		{
			self.chartToDisplay = self.macdChart;
			self.exportChart = self.exportmacdChart;
		}
		
		//may need to change this stuff		
		//make a post 
		var data = {
		type: 'POST',
		options: JSON.stringify(self.chartToDisplay),
		filename: 'test.png',
		type: 'image/png',
		async: true
		};
		
//come back here and involve the backend and do the alerts correctly
		var exportUrl = 'http://export.highcharts.com/';
		/*$http({url:"/facebook",data:data, method:"POST",headers:{'Content-Type':'application/json'}}).
		then(function(response)
		{
			console.log(response.data + " CHART JSON ");
			//var fbURL = exportUrl+response.data;
			//console.log(fbURL + " FB URL ");
			/*FB.ui({method:'feed',link:fbURL},function(response){
				console.log(response + " WHAT IS THIS RESPONSE ");
				if(response && !response.error_message){
					alert("Posted successfully");
				}
				else if(response && reponse.error_code == 4201){
					alert("Not posted");
				}
				else{
					alert("Not posted");
				}
				
			});
			
		},
		function(response){
			console.log("Could not get picture to post on Facebook");
		}
		
		
		);*/
		
		//come back to this if ur low on time
		/*$.post(exportUrl, data, function(data) {
			var imageUrl = exportUrl + data;
			var urlCreator = window.URL || window.webkitURL;
			console.log(imageUrl + " WE REALLY USING THIS?");
			fetch(imageUrl).then(response => response.blob()).then(data => {
				// You have access to chart data here
				console.log("THIS BETTER BE THE PIC ");
				console.log(data);
						FB.ui({
						method: 'feed',
						link: imageUrl,
						caption: 'An example caption',
						}, function(response){
							console.log(response + " FB RESPONSE ");
							if(response && !response.error_code){
								alert("Posted successfully");
							}
							else{
								alert("Not Posted");
							}
						});
				
				
			});
		});
		*/
			/*$http({
				url:"/facebook",
				method:"POST",
				data:"data="+chartdata,
				headers: {'Content-Type': 'application/x-www-form-urlencoded'}
			}).then(function(response)
			{//success
				console.log("FB RESPONSE");
				console.log(response);
			});*/
		
	}
	
	
	self.sortFavorites = function sortFavorites()
	{
		//console.log("SORTING FAVORITES RN ");
		//self.favoritesArray = [];
		/*for(var entry in self.favorites){
			self.favoritesArray.push(entry);			
		}*/
		
		self.favoritesArray.sort(
			function compare(a,b){
				if(self.favoriteSortOrder){//true means it should be descending
					if(a[self.favoriteSortField] > b[self.favoriteSortField]){
						return -1;
						
					}
					
					if(a[self.favoriteSortField] < b[self.favoriteSortField]){
						return 1;
					}
					
					else{
						return 0;
					}
					
					
				}
				
				else{
					
					if(a[self.favoriteSortField] > b[self.favoriteSortField]){
						return 1;
						
					}
					
					if(a[self.favoriteSortField] < b[self.favoriteSortField]){
						return -1;
					}
					
					else{
						return 0;
					}
					
				}			
				
			}
		);
	}
	
	self.getSortField = function getSortOptions(sortField)//get the field and asc/desc
	{
		//console.log("GETTING SORT OPTION: "+ sortField);
		self.favoriteSortField = self.sortFilterMap[sortField];
		//console.log("CHANGED SORT OPTION");
		//jank will try to do something else
		//console.log(self.favoriteSortField + " SORT FIELD ");
	}
	
	self.getSortOrder = function getSortOrder(sortOrder)
	{
		//console.log("GETTING SORT ORDER: "+ sortOrder);
		self.favoriteSortOrder = self.sortFilterMap[sortOrder];
		//console.log("CHANGED SORT ORDER");
		//jank will try to do something else
		console.log(self.favoriteSortOrder + " SORT ORDER");
	}
	
	
	self.IsTextEmpty = function IsTextEmpty(){
		
		return (self.searchText == null) || (self.searchText == "");		
	}
	
	self.clearQuote = function clearQuote(){//try to clear the textbar and reset the data arrays
		//console.log("AM I BEING CALLED");
		self.resetVariables();
		//showFavorites();//take us back to the homepage bruh
	}
	
	self.addToFavorites = function addToFavorites()
	{
		console.log("ADDING TO FAVORITES");
		
		//symbol, stock price, change + change percent, volume
		if(!self.IsInFavorites() && self.loadedQuotes)//don't do anything until the quotes are all loaded
		{	var favoriteEntry = {};
			favoriteEntry["Symbol"] = self.currSymbol;//self.searchText;
			favoriteEntry["Stock Price"] = parseFloat(self.recentQuote['4. close']);
			favoriteEntry["Stock Price Change Val"] = self.priceChangeVal;
			favoriteEntry["Stock Price Change Percent"] = self.percentChange;
			favoriteEntry["Volume"] = parseInt(self.recentQuote['5. volume']);			
			var currSize = self.favorites.size;
			favoriteEntry["Order"] = currSize;//so we can sort by order of insertion
			self.favorites.size +=1;
			self.favorites[self.searchText] = favoriteEntry;
			self.favoritesArray.push(favoriteEntry);
			console.log("NEW ENTRY");
			console.log(self.favorites.size + " FAV SIZE NOW ");
		}
		//if quote are loaded and we click the favorite button when the favorite's already there, create a toggle effect
		else if(self.loadedQuotes && self.IsInFavorites()){
			//gotta remove the elem then
			self.deleteFavorite(self.currSymbol);//hope this works
			
		}
	
	}
	
	self.IsInFavorites = function IsInFavorites(){
		return (self.currSymbol in self.favorites);
	}
	
	//JUST DISPLAY THE CHARTS FIRST. WE CAN FIGURE OUT HOW TO GET THE MINOR DETAILS CORRECT LATER
	//MIgHT HAVE TO REFACTOR THIS to allow for the refresh-.-
	self.getQuote = function getQuote(symbolText)
	{
		//perform validation
		//make sure text is not empty and contains non-space characters
		if(!self.IsTextEmpty())
		{
			//reset some variables????
			self.selectedItem = null;
			self.currSymbol = "";
			self.loadedQuotes = false;
			//self.querySearch   = querySearch;
			self.stocks = [];
			self.quotes = {};//also doubles as having price information
			//other indicators
			self.sma = {};
			self.ema = {};
			self.stoch = {};
			self.rsi = {};
			self.adx = {};
			self.cci = {};
			self.bbands = {};
			self.macd = {};
			//self.history = {};
			
			self.quotesWait = true;
			self.smaWait = true;
			self.emaWait = true;
			self.stochWait = true;
			self.rsiWait = true;
			self.adxWait = true;
			self.cciWait = true;
			self.bbandsWait = true;
			self.macdWait = true;
			self.historyWait = true;
			self.newsWait = true;
			self.showingFavorites = true;
			
			
			self.quotesFail = false;
			self.smaFail = false;
			self.emaFail = false;
			self.stochFail = false;
			self.rsiFail = false;
			self.adxFail = false;
			self.cciFail = false;
			self.bbandsFail = false;
			self.macdFail = false;
			self.historyFail = false;
			
			
			self.recentQuote = {};
			self.prevRecentQuote = {};
			self.percentChange = "";
			self.priceChangeVal = Number.MIN_VALUE;
			self.timeStamp = "";
			self.closePrice = "";
			
			//if bugs show up get rid of this reassignment block
			self.priceChart = {};
			self.smaChart = {};
			self.emaChart = {};
			self.stochChart = {};
			self.rsiChart = {};
			self.adxChart = {};
			self.cciChart = {};
			self.bbandsChart = {};
			self.macdChart = {};
			self.chartToDisplay = {};	
			self.exportChart = {};
			self.exportPriceChart = {};
			self.exportsmaChart = {};
			self.exportemaChart = {};
			self.exportstochChart = {};
			self.exportrsiChart = {};
			self.exportadxChart = {};
			self.exportcciChart = {};
			self.exportbbandsChart = {};
			self.exportmacdChart = {};
			//delete block above if trouble arises

			
			//remove above code if weird stuff happens
	
			//tell node to make the price request
			if(symbolText != ''){//we passed in the stock parameter in the function
				self.searchText = symbolText.toUpperCase();
				self.currSymbol = self.searchText;
			}
			else{//otherwise just use text that's already in the search text field
				self.searchText = self.searchText.toUpperCase();
				self.currSymbol = self.searchText;
			}
			var searchText = self.searchText;
			
			//console.log("TIME TO GET QUOTES " + searchText);
			
			
			$http({
				url:"/quote",
				method:"GET",
				params:{searchText}
			}).then(function(response)
			{//success
				self.quotesWait = false;
				self.quotes = response.data;
				var timeSeriesData = response.data["Time Series (Daily)"];
				var count = 0;
				for(var entry in timeSeriesData){
					if(count >= 2){
						break;
					}
					++count;
					if(count == 1){
						self.recentQuote = timeSeriesData[entry];
					}
					
					if(count == 2){
						self.prevRecentQuote = timeSeriesData[entry];
					}
				}
				//console.log(self.recentQuote + " RECENT ");
				//console.log(self.prevRecentQuote + " PREV ");
				
				var percentChangeVal = (((parseFloat(self.recentQuote["4. close"])-parseFloat(self.prevRecentQuote["4. close"]))
				/(parseFloat(self.prevRecentQuote["4. close"]))*100)).toFixed(2);
				var changeVal = (parseFloat(self.recentQuote["4. close"])-parseFloat(self.prevRecentQuote["4. close"])).toFixed(2);
				self.percentChange = changeVal + " ("+percentChangeVal + "%)";
				self.priceChangeVal = changeVal;
				//self.lastPrice = parseFloat(self.recentQuote["4. close"]).toFixed(2)+"";
				
				self.timeStamp = response.data["TimeStamp"];
				var currHr = parseInt(self.timeStamp.substring(self.timeStamp.search(" "),self.timeStamp.search(":")));
				//console.log(currHr + " CURR HR ");
				self.closePrice = self.prevRecentQuote["4. close"];
				if(currHr >= 16){//if it's past four
					//console.log(" ITS CURR OBJ NOW ");
					self.closePrice = self.recentQuote["4. close"];
				}
				
				//call highcharts????....ok i don't think i can call this yet
				var chartTitle = searchText+ " Stock Price and Volume";
				var xAxisArray = [];
				var yAxisStockArray = [];
				var yAxisVolArray = [];
				
				//time to fill the arrays with data points
				var count = 0;
				for(var key in timeSeriesData){
					if(count == TOTAL_WORKDAYS){
						break;
					}
					
					//dates for the xAxisArray
					var parseStr = key.substr(key.search("-")+1);
					var monthStr = parseStr.substr(0,parseStr.search("-"));
					parseStr = parseStr.substr(parseStr.search("-")+1);
					var dayStr = parseStr;
					xAxisArray.push(monthStr+"/"+dayStr);
					
					//now for the yaxisarrays
					yAxisStockArray.push(parseFloat(timeSeriesData[key]["4. close"]));
					yAxisVolArray.push(parseFloat(timeSeriesData[key]["5. volume"]));
					
					++count;
				}
				
				
				
				var title = {
					text:chartTitle					
				};
				
				var subtitle = {
					text:'<a target="_blank" href="https://www.alphavantage.co/">Source: Alpha Vantage</a>',
					style:{
						color:'blue'
					},
					useHTML:true
				};
				
				var chartLegend = {
					
					align: 'center',
					verticalAlign: 'bottom',
					borderWidth:0					
				};
				
				var chartXAxis ={
					
					categories:xAxisArray,
					reversed:true,
					labels:{
						style:{
						fontSize:'12px'
						}
					}
				};
				
				
				var priceMin = yAxisStockArray[0];
				var priceMax = yAxisStockArray[0];
				for(var i=1;i<yAxisStockArray.length;++i){//high charts was picky about displaying the axes -.-
					if(yAxisStockArray[i] > priceMax){
						priceMax = yAxisStockArray[i];
					}
								
					if(yAxisStockArray[i] < priceMin){
						priceMin = yAxisStockArray[i];
					}
								
				}
							
				var chartYAxis =
				[
				{

					tickInterval:50,
					title:{
						text:"Stock Price"					
					},
					
					plotLines: [{
					value: 0,
					width: 1,
					color: '#808080'
				    }]						  
				},
				{
					tickInterval:20000000,
					title:{
					text:"Volume"					
					},
					opposite:true,
								
					plotLines: [{
					value: 0,
					width: 1,
					color: '#808080'
				   }]						  
					}
				];				
				
				var chartSeries = [];
				
				chartSeries = [{type:'area',borderWidth:0,name:"Price",data:yAxisStockArray,yAxis:0,color:Highcharts.getOptions().colors[4]},
							{type:'column',borderWidth:0,name:"Volume",data:yAxisVolArray,yAxis:1,color:Highcharts.getOptions().colors[8]}
				];
				
				
				
				var	chartJSON = {
					plotOptions:{
					series:{
						fillOpacity:0.1
					}					
						
					,
					line:{
						lineWidth:1,
						marker:{
						enabled:false
						}									
					}							
				}
			};
				chartJSON.chart = {
					zoomType: 'x'
				};
				chartJSON.title = title;
				chartJSON.subtitle = subtitle;
				chartJSON.xAxis = chartXAxis;
				chartJSON.yAxis = chartYAxis;
				chartJSON.legend = chartLegend;
				chartJSON.series = chartSeries;
				
				//testing out export module
				/*chartJSON.exporting = {enabled:true,
				filename:"CSCI571HW8CHART",
			    url:"http://localhost:8080"
				};*/
				
				self.priceChart = chartJSON;
				self.chartToDisplay = chartJSON;//will store the price chart by default
				self.exportPriceChart = Highcharts.chart('priceChartDiv',chartJSON);
				self.exportChart = self.exportPriceChart;
				//console.log(JSON.stringify(chartJSON));
				//Highcharts.exportChart({filename:"HOMEWORK"});
				//console.log(priceval);
				//console.log(priceval);
			

			},
			
			function(response){
				self.quotesFail = true;
				console.log("FAILED TO GET QUOTE");
				console.log(response.data);				
				
			}		
			
			);
			
			//indicator requests
			$http({
				url:"/sma",
				method:"GET",
				params:{searchText}
			}).then(function(response)
			{//success
				self.smaWait = false;
				self.sma = response.data;
				//console.log("GOT SMA");
				
				var chartTitle = "Simple Moving Average (SMA)";
				var xAxisArray = [];
				var yAxisArray = [];
				var techAnalysisData = response.data["Technical Analysis: SMA"];
				//time to fill the arrays with data points
				var count = 0;
				for(var key in techAnalysisData){
					if(count == TOTAL_WORKDAYS){
						break;
					}
					
					//dates for the xAxisArray
					var parseStr = key.substr(key.search("-")+1);
					var monthStr = parseStr.substr(0,parseStr.search("-"));
					parseStr = parseStr.substr(parseStr.search("-")+1);
					var dayStr = parseStr;
					xAxisArray.push(monthStr+"/"+dayStr);
					
					//now for the yaxisarrays
					yAxisArray.push(parseFloat(techAnalysisData[key]["SMA"]));
					
					++count;
				}				
				
				
				var title = {
					text:chartTitle					
				};
				
				var subtitle = {
					text:'<a target="_blank" href="https://www.alphavantage.co/">Source: Alpha Vantage</a>',
					style:{
						color:'blue'
					},
					useHTML:true
				};
				
				var chartLegend = {
					
					align: 'center',
					verticalAlign: 'bottom',
					borderWidth:0					
				};
				
				var chartXAxis ={
					tickInterval:5,
					categories:xAxisArray,
					reversed:true,
					labels:{
						style:{
						fontSize:'12px'
						}
					}
				};
				
				
				var priceMin = yAxisArray[0];
				var priceMax = yAxisArray[0];
				for(var i=1;i<yAxisArray.length;++i){//high charts was picky about displaying the axes -.-
					if(yAxisArray[i] > priceMax){
						priceMax = yAxisArray[i];
					}
								
					if(yAxisArray[i] < priceMin){
						priceMin = yAxisArray[i];
					}
								
				}
							
				var chartYAxis =
				{
					title:{
						text:"SMA"	
					},
								
					plotLines: [{
						value: 0,
						width: 1,
						color: '#808080'
					   }]						  
				};
				
				var chartSeries = [];
				
				chartSeries = [{borderWidth:0,name:searchText,data:yAxisArray,color:Highcharts.getOptions().colors[0]}];
				
				
				
				var	chartJSON = {
					plotOptions:{
					series:{
						fillOpacity:0.1
					}					
						
					,
					line:{
						lineWidth:1,
						marker:{
						enabled:false
						}									
					}							
				}
			};
			
				chartJSON.chart = {
					zoomType: 'x'
				};
				chartJSON.title = title;
				chartJSON.subtitle = subtitle;
				chartJSON.xAxis = chartXAxis;
				chartJSON.yAxis = chartYAxis;
				chartJSON.legend = chartLegend;
				chartJSON.series = chartSeries;
				self.smaChart = chartJSON;
				self.exportsmaChart = Highcharts.chart('smaChartDiv',chartJSON);			
				
			},
			
			function(response){
				self.smaFail = true;
				console.log("FAILED TO GET SMA");
				console.log(response.data);				
				
			}	
			
			
			);
			
			$http({
				url:"/ema",
				method:"GET",
				params:{searchText}
			}).then(function(response)
			{//success
				self.emaWait = false;
				self.ema = response.data;
				//console.log("GOT EMA");
				var chartTitle = "Exponential Moving Average (EMA)";
				var xAxisArray = [];
				var yAxisArray = [];
				var techAnalysisData = response.data["Technical Analysis: EMA"];
				//time to fill the arrays with data points
				var count = 0;
				for(var key in techAnalysisData){
					if(count == TOTAL_WORKDAYS){
						break;
					}
					
					//dates for the xAxisArray
					var parseStr = key.substr(key.search("-")+1);
					var monthStr = parseStr.substr(0,parseStr.search("-"));
					parseStr = parseStr.substr(parseStr.search("-")+1);
					var dayStr = parseStr;
					xAxisArray.push(monthStr+"/"+dayStr);
					
					//now for the yaxisarrays
					yAxisArray.push(parseFloat(techAnalysisData[key]["EMA"]));
					
					++count;
				}				
				
				
				var title = {
					text:chartTitle					
				};
				
				var subtitle = {
					text:'<a target="_blank" href="https://www.alphavantage.co/">Source: Alpha Vantage</a>',
					style:{
						color:'blue'
					},
					useHTML:true
				};
				
				var chartLegend = {
					
					align: 'center',
					verticalAlign: 'bottom',
					borderWidth:0					
				};
				
				var chartXAxis ={
					tickInterval:5,
					categories:xAxisArray,
					reversed:true,
					labels:{
						style:{
						fontSize:'12px'
						}
					}
				};
				
				
				var priceMin = yAxisArray[0];
				var priceMax = yAxisArray[0];
				for(var i=1;i<yAxisArray.length;++i){//high charts was picky about displaying the axes -.-
					if(yAxisArray[i] > priceMax){
						priceMax = yAxisArray[i];
					}
								
					if(yAxisArray[i] < priceMin){
						priceMin = yAxisArray[i];
					}
								
				}
							
				var chartYAxis =
				{
					title:{
						text:"EMA"	
					},
								
					plotLines: [{
						value: 0,
						width: 1,
						color: '#808080'
					   }]						  
				};
				
				var chartSeries = [];
				
				chartSeries = [{borderWidth:0,name:searchText,data:yAxisArray,color:Highcharts.getOptions().colors[1]}];
				
				
				
				var	chartJSON = {
					plotOptions:{
					series:{
						fillOpacity:0.1
					}					
						
					,
					line:{
						lineWidth:1,
						marker:{
						enabled:false
						}									
					}							
				}
			};
				chartJSON.chart = {
					zoomType: 'x'
				};
				chartJSON.title = title;
				chartJSON.subtitle = subtitle;
				chartJSON.xAxis = chartXAxis;
				chartJSON.yAxis = chartYAxis;
				chartJSON.legend = chartLegend;
				chartJSON.series = chartSeries;
				self.emaChart = chartJSON;
				self.exportemaChart = Highcharts.chart('emaChartDiv',chartJSON);						
								
			},
			
			function(response){
				self.emaFail = true;
				console.log("FAILED TO GET EMA");
				console.log(response.data);				
				
			}	
			
			
			);
			
			
			$http({
				url:"/stoch",
				method:"GET",
				params:{searchText}
			}).then(function(response){//success
				self.stochWait = false;
				self.stoch = response.data;
				//console.log("GOT STOCH");
				
				var chartTitle = "Stochastic (STOCH)";
				var xAxisArray = [];
				var yAxisSlowKArray = [];
				var yAxisSlowDArray = [];
				var techAnalysisData = response.data["Technical Analysis: STOCH"];
				//time to fill the arrays with data points
				var count = 0;
				for(var key in techAnalysisData){
					if(count == TOTAL_WORKDAYS){
						break;
					}
					
					//dates for the xAxisArray
					var parseStr = key.substr(key.search("-")+1);
					var monthStr = parseStr.substr(0,parseStr.search("-"));
					parseStr = parseStr.substr(parseStr.search("-")+1);
					var dayStr = parseStr;
					xAxisArray.push(monthStr+"/"+dayStr);
					
					//now for the yaxisarrays
					yAxisSlowKArray.push(parseFloat(techAnalysisData[key]["SlowK"]));
					yAxisSlowDArray.push(parseFloat(techAnalysisData[key]["SlowD"]));
					++count;
				}				
				
				
				var title = {
					text:chartTitle					
				};
				
				var subtitle = {
					text:'<a target="_blank" href="https://www.alphavantage.co/">Source: Alpha Vantage</a>',
					style:{
						color:'blue'
					},
					useHTML:true
				};
				
				var chartLegend = {
					
					align: 'center',
					verticalAlign: 'bottom',
					borderWidth:0					
				};
				
				var chartXAxis ={
					tickInterval:5,
					categories:xAxisArray,
					reversed:true,
					labels:{
						style:{
						fontSize:'12px'
						}
					}
				};
				
				
					
				var chartYAxis =
				{
					title:{
						text:"STOCH"	
					},
								
					plotLines: [{
						value: 0,
						width: 1,
						color: '#808080'
					   }]						  
				};
				
				var chartSeries = [];
				
				chartSeries = [{borderWidth:0,name:searchText+ " SlowK",data:yAxisSlowKArray,color:Highcharts.getOptions().colors[8]},
							{borderWidth:0,name:searchText+ " SlowD",data:yAxisSlowDArray}
				];
				
				
				var	chartJSON = {
					plotOptions:{
					series:{
						fillOpacity:0.1
					}					
						
					,
					line:{
						lineWidth:1,
						marker:{
						enabled:false
						}									
					}							
				}
			};
				chartJSON.chart = {
					zoomType: 'x'
				};
				chartJSON.title = title;
				chartJSON.subtitle = subtitle;
				chartJSON.xAxis = chartXAxis;
				chartJSON.yAxis = chartYAxis;
				chartJSON.legend = chartLegend;
				chartJSON.series = chartSeries;
				self.stochChart = chartJSON;
				self.exportstochChart = Highcharts.chart('stochChartDiv',chartJSON);					
			},
			
			function(response){
				self.stochFail = true;
				console.log("FAILED TO GET STOCH ");
				console.log(response.data);				
				
			}	
			
			
			);
			
			$http({
				url:"/rsi",
				method:"GET",
				params:{searchText}
			}).then(function(response){//success
				self.rsiWait = false;
				self.rsi = response.data;
				//console.log("GOT RSI");
				
								var chartTitle = "Relative Strength Index (RSI)";
				var xAxisArray = [];
				var yAxisArray = [];
				var techAnalysisData = response.data["Technical Analysis: RSI"];
				//time to fill the arrays with data points
				var count = 0;
				for(var key in techAnalysisData){
					if(count == TOTAL_WORKDAYS){
						break;
					}
					
					//dates for the xAxisArray
					var parseStr = key.substr(key.search("-")+1);
					var monthStr = parseStr.substr(0,parseStr.search("-"));
					parseStr = parseStr.substr(parseStr.search("-")+1);
					var dayStr = parseStr;
					xAxisArray.push(monthStr+"/"+dayStr);
					
					//now for the yaxisarrays
					yAxisArray.push(parseFloat(techAnalysisData[key]["RSI"]));
					
					++count;
				}				
				
				
				var title = {
					text:chartTitle					
				};
				
				var subtitle = {
					text:'<a target="_blank" href="https://www.alphavantage.co/">Source: Alpha Vantage</a>',
					style:{
						color:'blue'
					},
					useHTML:true
				};
				
				var chartLegend = {
					
					align: 'center',
					verticalAlign: 'bottom',
					borderWidth:0					
				};
				
				var chartXAxis ={
					tickInterval:5,
					categories:xAxisArray,
					reversed:true,
					labels:{
						style:{
						fontSize:'12px'
						}
					}
				};
				
				
				var priceMin = yAxisArray[0];
				var priceMax = yAxisArray[0];
				for(var i=1;i<yAxisArray.length;++i){//high charts was picky about displaying the axes -.-
					if(yAxisArray[i] > priceMax){
						priceMax = yAxisArray[i];
					}
								
					if(yAxisArray[i] < priceMin){
						priceMin = yAxisArray[i];
					}
								
				}
							
				var chartYAxis =
				{
					title:{
						text:"RSI"	
					},
								
					plotLines: [{
						value: 0,
						width: 1,
						color: '#808080'
					   }]						  
				};
				
				var chartSeries = [];
				
				chartSeries = [{borderWidth:0,name:searchText,data:yAxisArray,color:Highcharts.getOptions().colors[2]}];
				
				
				
				var	chartJSON = {
					plotOptions:{
					series:{
						fillOpacity:0.1
					}					
						
					,
					line:{
						lineWidth:1,
						marker:{
						enabled:false
						}									
					}							
				}
			};
				chartJSON.chart = {
					zoomType: 'x'
				};
				chartJSON.title = title;
				chartJSON.subtitle = subtitle;
				chartJSON.xAxis = chartXAxis;
				chartJSON.yAxis = chartYAxis;
				chartJSON.legend = chartLegend;
				chartJSON.series = chartSeries;
				self.rsiChart = chartJSON;
				self.exportrsiChart = Highcharts.chart('rsiChartDiv',chartJSON);				
				
			},
			
			function(response){
				self.rsiFail = true;
				console.log("FAILED TO GET RSI");
				console.log(response.data);				
				
			}	
			
			);
			
			$http({
				url:"/adx",
				method:"GET",
				params:{searchText}
			}).then(function(response){//success
				self.adxWait = false;
				self.adx = response.data;
				//console.log("GOT ADX");
				var chartTitle = "Average Directional Movement Index (ADX)";
				var xAxisArray = [];
				var yAxisArray = [];
				var techAnalysisData = response.data["Technical Analysis: ADX"];
				//time to fill the arrays with data points
				var count = 0;
				for(var key in techAnalysisData){
					if(count == TOTAL_WORKDAYS){
						break;
					}
					
					//dates for the xAxisArray
					var parseStr = key.substr(key.search("-")+1);
					var monthStr = parseStr.substr(0,parseStr.search("-"));
					parseStr = parseStr.substr(parseStr.search("-")+1);
					var dayStr = parseStr;
					xAxisArray.push(monthStr+"/"+dayStr);
					
					//now for the yaxisarrays
					yAxisArray.push(parseFloat(techAnalysisData[key]["ADX"]));
					
					++count;
				}				
				
				
				var title = {
					text:chartTitle					
				};
				
				var subtitle = {
					text:'<a target="_blank" href="https://www.alphavantage.co/">Source: Alpha Vantage</a>',
					style:{
						color:'blue'
					},
					useHTML:true
				};
				
				var chartLegend = {
					
					align: 'center',
					verticalAlign: 'bottom',
					borderWidth:0					
				};
				
				var chartXAxis ={
					tickInterval:5,
					categories:xAxisArray,
					reversed:true,
					labels:{
						style:{
						fontSize:'12px'
						}
					}
				};
				
				
				var priceMin = yAxisArray[0];
				var priceMax = yAxisArray[0];
				for(var i=1;i<yAxisArray.length;++i){//high charts was picky about displaying the axes -.-
					if(yAxisArray[i] > priceMax){
						priceMax = yAxisArray[i];
					}
								
					if(yAxisArray[i] < priceMin){
						priceMin = yAxisArray[i];
					}
								
				}
							
				var chartYAxis =
				{
					title:{
						text:"ADX"	
					},
								
					plotLines: [{
						value: 0,
						width: 1,
						color: '#808080'
					   }]						  
				};
				
				var chartSeries = [];
				
				chartSeries = [{borderWidth:0,name:searchText,data:yAxisArray,color:Highcharts.getOptions().colors[3]}];
				
				
				
				var	chartJSON = {
					plotOptions:{
					series:{
						fillOpacity:0.1
					}					
						
					,
					line:{
						lineWidth:1,
						marker:{
						enabled:false
						}									
					}							
				}
			};
				chartJSON.chart = {
					zoomType: 'x'
				};
				chartJSON.title = title;
				chartJSON.subtitle = subtitle;
				chartJSON.xAxis = chartXAxis;
				chartJSON.yAxis = chartYAxis;
				chartJSON.legend = chartLegend;
				chartJSON.series = chartSeries;
				self.adxChart = chartJSON;
				self.exportadxChart = Highcharts.chart('adxChartDiv',chartJSON);					
				
			},
			function(response){
				self.adxFail = true;
				console.log("FAILED TO GET ADX");
				console.log(response.data);				
				
			}	
			
			
			
			);
			
			$http({
				url:"/cci",
				method:"GET",
				params:{searchText}
			}).then(function(response){//success
				self.cciWait = false;
				self.cci = response.data;
				//console.log("GOT CCI");
				var chartTitle = "Commodity Channel Index (CCI)";
				var xAxisArray = [];
				var yAxisArray = [];
				var techAnalysisData = response.data["Technical Analysis: CCI"];
				//time to fill the arrays with data points
				var count = 0;
				for(var key in techAnalysisData){
					if(count == TOTAL_WORKDAYS){
						break;
					}
					
					//dates for the xAxisArray
					var parseStr = key.substr(key.search("-")+1);
					var monthStr = parseStr.substr(0,parseStr.search("-"));
					parseStr = parseStr.substr(parseStr.search("-")+1);
					var dayStr = parseStr;
					xAxisArray.push(monthStr+"/"+dayStr);
					
					//now for the yaxisarrays
					yAxisArray.push(parseFloat(techAnalysisData[key]["CCI"]));
					
					++count;
				}				
				
				
				var title = {
					text:chartTitle					
				};
				
				var subtitle = {
					text:'<a target="_blank" href="https://www.alphavantage.co/">Source: Alpha Vantage</a>',
					style:{
						color:'blue'
					},
					useHTML:true
				};
				
				var chartLegend = {
					
					align: 'center',
					verticalAlign: 'bottom',
					borderWidth:0					
				};
				
				var chartXAxis ={
					tickInterval:5,
					categories:xAxisArray,
					reversed:true,
					labels:{
						style:{
						fontSize:'12px'
						}
					}
				};
				
				
				var priceMin = yAxisArray[0];
				var priceMax = yAxisArray[0];
				for(var i=1;i<yAxisArray.length;++i){//high charts was picky about displaying the axes -.-
					if(yAxisArray[i] > priceMax){
						priceMax = yAxisArray[i];
					}
								
					if(yAxisArray[i] < priceMin){
						priceMin = yAxisArray[i];
					}
								
				}
							
				var chartYAxis =
				{
					title:{
						text:"CCI"	
					},
								
					plotLines: [{
						value: 0,
						width: 1,
						color: '#808080'
					   }]						  
				};
				
				var chartSeries = [];
				
				chartSeries = [{borderWidth:0,name:searchText,data:yAxisArray,color:Highcharts.getOptions().colors[4]}];
				
				
				
				var	chartJSON = {
					plotOptions:{
					series:{
						fillOpacity:0.1
					}					
						
					,
					line:{
						lineWidth:1,
						marker:{
						enabled:false
						}									
					}							
				}
			};
				chartJSON.chart = {
					zoomType: 'x'
				};
				chartJSON.title = title;
				chartJSON.subtitle = subtitle;
				chartJSON.xAxis = chartXAxis;
				chartJSON.yAxis = chartYAxis;
				chartJSON.legend = chartLegend;
				chartJSON.series = chartSeries;
				self.cciChart = chartJSON;
				self.exportcciChart = Highcharts.chart('cciChartDiv',chartJSON);	
				
				
			},
			function(response){
				self.cciFail = true;
				console.log("FAILED TO GET CCI");
				console.log(response.data);				
				
			}	
			
			
			
			
			);
			
			
			$http({
				url:"/bbands",
				method:"GET",
				params:{searchText}
			}).then(function(response){//success
				self.bbandsWait = false;
				self.bbands = response.data;
				//console.log("GOT BBANDS");
				
				
				var chartTitle = "Bollinger Bands (BBANDS)";
				var xAxisArray = [];
				var yAxisLowerBandArray = [];
				var yAxisUpperBandArray = [];
				var yAxisMiddleBandArray = [];
				
				var techAnalysisData = response.data["Technical Analysis: BBANDS"];
				//time to fill the arrays with data points
				var count = 0;
				for(var key in techAnalysisData){
					if(count == TOTAL_WORKDAYS){
						break;
					}
					
					//dates for the xAxisArray
					var parseStr = key.substr(key.search("-")+1);
					var monthStr = parseStr.substr(0,parseStr.search("-"));
					parseStr = parseStr.substr(parseStr.search("-")+1);
					var dayStr = parseStr;
					xAxisArray.push(monthStr+"/"+dayStr);
					
					//now for the yaxisarrays
					yAxisLowerBandArray.push(parseFloat(techAnalysisData[key]["Real Lower Band"]));
					yAxisUpperBandArray.push(parseFloat(techAnalysisData[key]["Real Upper Band"]));
					yAxisMiddleBandArray.push(parseFloat(techAnalysisData[key]["Real Middle Band"]));
					++count;
				}				
				
				
				var title = {
					text:chartTitle					
				};
				
				var subtitle = {
					text:'<a target="_blank" href="https://www.alphavantage.co/">Source: Alpha Vantage</a>',
					style:{
						color:'blue'
					},
					useHTML:true
				};
				
				var chartLegend = {
					
					align: 'center',
					verticalAlign: 'bottom',
					borderWidth:0					
				};
				
				var chartXAxis ={
					tickInterval:5,
					categories:xAxisArray,
					reversed:true,
					labels:{
						style:{
						fontSize:'12px'
						}
					}
				};
				
				
					
				var chartYAxis =
				{
					title:{
						text:"BBANDS"	
					},
								
					plotLines: [{
						value: 0,
						width: 1,
						color: '#808080'
					   }]						  
				};
				
				var chartSeries = [];
				
				chartSeries = [{borderWidth:0,name:searchText+ " Real Middle Band",data:yAxisMiddleBandArray,color:Highcharts.getOptions().colors[8]},
				{borderWidth:0,name:searchText+ " Real Upper Band",data:yAxisUpperBandArray},
				{borderWidth:0,name:searchText+ " Real Lower Band",data:yAxisLowerBandArray,color:Highcharts.getOptions().colors[5]}
				];
				
				
				var	chartJSON = {
					plotOptions:{
					series:{
						fillOpacity:0.1
					}					
						
					,
					line:{
						lineWidth:1,
						marker:{
						enabled:false
						}									
					}							
				}
			};
				chartJSON.chart = {
					zoomType: 'x'
				};
				chartJSON.title = title;
				chartJSON.subtitle = subtitle;
				chartJSON.xAxis = chartXAxis;
				chartJSON.yAxis = chartYAxis;
				chartJSON.legend = chartLegend;
				chartJSON.series = chartSeries;
				self.bbandsChart = chartJSON;
				self.exportbbandsChart = Highcharts.chart('bbandsChartDiv',chartJSON);				
				
				
				
			},
			
			function(response){
				self.bbandsFail = true;
				console.log("FAILED TO GET BBANDS");
				console.log(response.data);					
			}	
			
			
			);
			
			$http({
				url:"/macd",
				method:"GET",
				params:{searchText}
			}).then(function(response){//success
				self.macdWait = false;
				self.macd = response.data;
				//console.log("GOT MACD");
								var chartTitle = "Moving Average Convergence/Divergence (MACD)";
				var xAxisArray = [];
				var yAxisMACDArray = [];
				var yAxisMACDHistArray = [];
				var yAxisMACDSignalArray = [];
				
				var techAnalysisData = response.data["Technical Analysis: MACD"];
				//time to fill the arrays with data points
				var count = 0;
				for(var key in techAnalysisData){
					if(count == TOTAL_WORKDAYS){
						break;
					}
					
					//dates for the xAxisArray
					var parseStr = key.substr(key.search("-")+1);
					var monthStr = parseStr.substr(0,parseStr.search("-"));
					parseStr = parseStr.substr(parseStr.search("-")+1);
					var dayStr = parseStr;
					xAxisArray.push(monthStr+"/"+dayStr);
					
					//now for the yaxisarrays
					yAxisMACDArray.push(parseFloat(techAnalysisData[key]["MACD"]));
					yAxisMACDHistArray.push(parseFloat(techAnalysisData[key]["MACD_Hist"]));
					yAxisMACDSignalArray.push(parseFloat(techAnalysisData[key]["MACD_Signal"]));
					++count;
				}				
				
				
				var title = {
					text:chartTitle					
				};
				
				var subtitle = {
					text:'<a target="_blank" href="https://www.alphavantage.co/">Source: Alpha Vantage</a>',
					style:{
						color:'blue'
					},
					useHTML:true
				};
				
				var chartLegend = {
					
					align: 'center',
					verticalAlign: 'bottom',
					borderWidth:0					
				};
				
				var chartXAxis ={
					tickInterval:5,
					categories:xAxisArray,
					reversed:true,
					labels:{
						style:{
						fontSize:'12px'
						}
					}
				};
				
				
					
				var chartYAxis =
				{
					title:{
						text:"MACD"	
					},
								
					plotLines: [{
						value: 0,
						width: 1,
						color: '#808080'
					   }]						  
				};
				
				var chartSeries = [];
				
				chartSeries = [{borderWidth:0,name:searchText+ " MACD",data:yAxisMACDArray,color:Highcharts.getOptions().colors[8]},
				{borderWidth:0,name:searchText+ " MACD_Hist",data:yAxisMACDHistArray},
				{borderWidth:0,name:searchText+ " MACD_Signal",data:yAxisMACDSignalArray,color:Highcharts.getOptions().colors[5]}
				];
				
				
				var	chartJSON = {
					plotOptions:{
					series:{
						fillOpacity:0.1
					}					
						
					,
					line:{
						lineWidth:1,
						marker:{
						enabled:false
						}									
					}							
				}
			};
				chartJSON.chart = {
					zoomType: 'x'
				};
				chartJSON.title = title;
				chartJSON.subtitle = subtitle;
				chartJSON.xAxis = chartXAxis;
				chartJSON.yAxis = chartYAxis;
				chartJSON.legend = chartLegend;
				chartJSON.series = chartSeries;
				self.macdChart = chartJSON;
				self.exportmacdChart = 	Highcharts.chart('macdChartDiv',chartJSON);				
				
			},
				function(response){
				self.macdFail = true;
				console.log("FAILED TO GET MACD");
				console.log(response.data);				
				
			}	
			
			);
			
		//time to get some stock news...the first five	
			$http({
				url:"/news",
				method:"GET",
				params:{searchText}
			}).then(function(response){//success
				self.news = response.data.rss.channel.item.slice(0,5);//only first five entries
				for(var i=0;i<5;++i){
					self.news[i].pubDate.$t = self.news[i].pubDate.$t.substring(0,self.news[i].pubDate.$t.search("-")) + " EDT";					
				}
				self.newsWait = false;
				/*for(var key in self.news){
					console.log(key + " KEY " + self.news[key] + " VAL ");
				}*/
				//console.log(JSON.stringify(self.news));
				
				//console.log(JSON.stringify(self.news));
				//console.log(self.news.length + " NUM ITEMS ");
			},
			function(response){
				self.newsFail = true;
				console.log("FAILED TO GET NEWS");
			}
			
			);
			
			//history stock time
			$http({
				url:"/history",
				method:"GET",
				params:{searchText}
			}).then(function(response)
			{//success
				self.historyWait = false;
				//preprocess to get arrays for history
				var dataEntries = response.data["Time Series (Daily)"];
				var historyArray = [];
				const LIMIT = 1000;
				var count = 0;
				for(var entry in dataEntries){
					if(count >= LIMIT){
						break;
					}
					//add timestamp and price to the historyArray
					//console.log(entry + " ENTRY ?");
					//console.log(dataEntries[entry]["4. close"]);	
					//"2017-11-07"
					var date = Date.parse(entry);			
					//console.log(date + " DATE ");
					var arr = [];
					arr.push(date);
					arr.push(parseFloat(dataEntries[entry]["4. close"]));
					historyArray.push(arr);
					++count;
						
				}
				historyArray.reverse();
				//console.log(historyArray.length + " HOW MANY ELEMS IN HISTORY ARRAY");
				
			var buttonsArray = [];
				
			if(window.screen.width <= 570)
			{//mobile shouldn't show as many tags
					buttonsArray = [
			
				{
					type: 'month',
					count: 1,
					text: '1m',
					dataGrouping: {
						forced: true,
						units: [['week', [1]]]
					}
				}, {
					type: 'month',
					count: 3,
					text: '3m',
					dataGrouping: {
						forced: true,
						units: [['week', [1]]]
					}
				}, 
				 {
					type: 'month',
					count: 6,
					text: '6m',
					dataGrouping: {
						forced: true,
						units: [['week', [1]]]
					}
				},
				
				{
					type: 'year',
					count: 1,
					text: '1y',
					dataGrouping: {
						forced: true,
						units: [['week', [1]]]
					}
				}
				
				
				,{
					type: 'all',
					text: 'All',
					dataGrouping: {
						forced: true,
						units: [['month', [1]]]
					}
				}];
			}
				
			else{	
				buttonsArray = [
			{
                type: 'week',
                count: 1,
                text: '1w',
                dataGrouping: {
                    forced: true,
                    units: [['day', [1]]]
                }
            },			
			
			{
                type: 'month',
                count: 1,
                text: '1m',
                dataGrouping: {
                    forced: true,
                    units: [['week', [1]]]
                }
            }, {
                type: 'month',
                count: 3,
                text: '3m',
                dataGrouping: {
                    forced: true,
                    units: [['week', [1]]]
                }
            }, 
			 {
                type: 'month',
                count: 6,
                text: '6m',
                dataGrouping: {
                    forced: true,
                    units: [['week', [1]]]
                }
            },
			 {
                type: 'year', //figure out how to do ytd and the other fields properly
                count: 1,
                text: 'YTD',
                dataGrouping: {
                    forced: true,
                    units: [['month', [1]]]
                }
            },
			
			{
                type: 'year',
                count: 1,
                text: '1y',
                dataGrouping: {
                    forced: true,
                    units: [['week', [1]]]
                }
            }
			
			
			,{
                type: 'all',
                text: 'All',
                dataGrouping: {
                    forced: true,
                    units: [['month', [1]]]
                }
            }];
			}			
				Highcharts.stockChart('historicalChartDiv', 
			{

        /*chart: {
            height: 300
        },*/

        rangeSelector: {
            allButtonsEnabled: true,
            buttons: buttonsArray,
            buttonTheme: {
                width: 60
            },
            selected: 0
        },

        title: {
            text: searchText +' Stock Value'
        },

        subtitle: {
            text:'<a target="_blank" href="https://www.alphavantage.co/">Source: Alpha Vantage</a>',
			style:{
				color:'blue'
			},
			useHTML:true
        },

		legend:{
			layout:'vertical',
			align:'right',
			verticalAlign:'middle',
			borderWidth:0			
		},
		
        _navigator: {
            enabled: false
        },
		
		yAxis:{
			tickInterval:50,
			
			title:{
				text:"Stock Value"				
			},
								
			plotLines: [{
				value: 0,
				width: 1,
				color: '#808080'
			}]						  
		},

        series: [{
            name: searchText,
            data: historyArray,
			type:"area",
            marker: {
                enabled: null, // auto
                radius: 3,
                lineWidth: 1,
                lineColor: '#FFFFFF'
            },
            tooltip: {
                valueDecimals: 2
            }
        }]
    });
				
				
				
				
				
				
				
				
				
			},
			
			function(response){
				self.historyFail = true;
				console.log("FAILED TO GET HISTORY");
				//console.log(response.data);				
				
			}
			
			
			
			);
		
		
			
			
		//for the history chart	
		//try and get node.js involved with this call later on
		//set a history variable or something to control loading
		//var historyURL = "http://www.highcharts.com/samples/data/jsonp.php?filename=";
		
		
		
		
		
		
		
		
		
		
		
		
		
		
	/*	$.getJSON(historyURL+searchText+"-c.json&callback=?", function (data) {
    // Create the chart
    Highcharts.stockChart('historicalChart', 
	{

        chart: {
            height: 300
        },

        rangeSelector: {
            allButtonsEnabled: true,
            buttons: [
			{
                type: 'week',
                count: 1,
                text: '1w',
                dataGrouping: {
                    forced: true,
                    units: [['day', [1]]]
                }
            },			
			
			{
                type: 'month',
                count: 1,
                text: '1m',
                dataGrouping: {
                    forced: true,
                    units: [['week', [1]]]
                }
            }, {
                type: 'month',
                count: 3,
                text: '3m',
                dataGrouping: {
                    forced: true,
                    units: [['week', [1]]]
                }
            }, 
			 {
                type: 'month',
                count: 6,
                text: '6m',
                dataGrouping: {
                    forced: true,
                    units: [['week', [1]]]
                }
            },
			 {
                type: 'year', //figure out how to do ytd and the other fields properly
                count: 1,
                text: 'YTD',
                dataGrouping: {
                    forced: true,
                    units: [['month', [1]]]
                }
            },
			
			{
                type: 'year',
                count: 1,
                text: '1y',
                dataGrouping: {
                    forced: true,
                    units: [['week', [1]]]
                }
            }
			
			
			,{
                type: 'all',
                text: 'All',
                dataGrouping: {
                    forced: true,
                    units: [['month', [1]]]
                }
            }],
            buttonTheme: {
                width: 60
            },
            selected: 0
        },

        title: {
            text: searchText +' Stock Value'
        },

        subtitle: {
            text:'<a target="_blank" href="https://www.alphavantage.co/">Source: Alpha Vantage</a>',
			style:{
				color:'blue'
			},
			useHTML:true
        },

		legend:{
			layout:'vertical',
			align:'right',
			verticalAlign:'middle',
			borderWidth:0			
		},
		
        _navigator: {
            enabled: false
        },
		
		yAxis:{
			tickInterval:50,
			
			title:{
				text:"Stock Value"				
			},
								
			plotLines: [{
				value: 0,
				width: 1,
				color: '#808080'
			}]						  
		},

        series: [{
            name: searchText,
            data: data,
			type:"area",
            marker: {
                enabled: null, // auto
                radius: 3,
                lineWidth: 1,
                lineColor: '#FFFFFF'
            },
            tooltip: {
                valueDecimals: 2
            }
        }]
    });
});*/
			
			
			
			
		}	

		self.loadedQuotes = true;
		self.showingFavorites = false;
		//switch the panel..otherwise highcharts can't draw in the div cuz it doesn't exist yet
		//draw the charts after the panel has shown up
		
	}
	
	self.isQuotesLoaded = function isQuotesLoaded(){
		//console.log(self.loadedQuotes + " CURR VALUE OF LOADED ");
		return self.loadedQuotes;
	}

    /**
     * Search for states... use $timeout to simulate
     * remote dataservice call.
     */
    self.querySearch = function querySearch (query) 
	{//if querySearch causes issues consider changing it to a request promise like hte others
	  if(query != "" && query!= null)
	    {
	  	  
		  self.stocks = $http({
			  url:"/autocomplete",
			  method:"GET",
			  params:{query}		  
		  }).
		  then(function(response){
			return response.data;
		  },
		  function(error){//error handling
			console.log("AUTOCOMPLETE ERROR");
		  }
		  
		  );

	    }
	}

    /**
     * Build `states` list of key/value pairs
     */
    function loadAll() {
      var allStates = 'Alabama, Alaska, Arizona, Arkansas, California, Colorado, Connecticut, Delaware,\
              Florida, Georgia, Hawaii, Idaho, Illinois, Indiana, Iowa, Kansas, Kentucky, Louisiana,\
              Maine, Maryland, Massachusetts, Michigan, Minnesota, Mississippi, Missouri, Montana,\
              Nebraska, Nevada, New Hampshire, New Jersey, New Mexico, New York, North Carolina,\
              North Dakota, Ohio, Oklahoma, Oregon, Pennsylvania, Rhode Island, South Carolina,\
              South Dakota, Tennessee, Texas, Utah, Vermont, Virginia, Washington, West Virginia,\
              Wisconsin, Wyoming';

      return allStates.split(/, +/g).map( function (state) {
        return {
          value: state.toLowerCase(),
          display: state
        };
      });
    }

    /**
     * Create filter function for a query string
     */
    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);

      return function filterFn(state) {
        return (state.value.indexOf(lowercaseQuery) === 0);
      };

    }
  }
})();


