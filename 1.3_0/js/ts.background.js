// GLOBAL ACCESSOR THAT THE POPUP USES.
var maxDuration = 60*60*24*6004;
var selectedId = null;
var selectedWindow = null;
var selectedMap = {};
var tabs = [];
var intervalId = null;
var intervalLength = null;
var bDebug = false;

//// UTIL

function debugLog(message){
	if( bDebug ){
		console.log(message);
	}
}

//// TAB SWITCHER (TAB SWISHA?)

var TabSwitcher = {
	isPlaying : function(){
		var state = Cookie.get('tabShow_state');
		
		return( state == 'playing' );
	},
	
	isPaused : function(){
		var state = Cookie.get('tabShow_state');
		
		return( state != 'playing' );
	},
	
	setDefaultInterval : function( defaultInterval ){
		Cookie.set( 'tabShow_interval', defaultInterval, { duration: maxDuration, path : chrome.extension.getURL('/') });
	},
	
	getSetDefaultInterval : function( defaultInterval ){
		var intervalFromCookie = Cookie.get('tabShow_interval');
		if( intervalFromCookie === null || !intervalFromCookie ){
			TabSwitcher.setDefaultInterval(defaultInterval);
			intervalFromCookie = defaultInterval;
		}
		
		return intervalFromCookie;
	},
	
	getLastTabIndex : function(tabs, currentTabId){
		for( var i = 0; i < tabs.length; i++ ){
			if( tabs[i] == currentTabId ){
				debugLog( 'Last Tab Index: ' + i );

				return i;
			}
		}
		
		return 0;
	},

	getNextIndex : function(tabs, lastIndex){
		if( lastIndex < tabs.length - 1 ){
			return (lastIndex + 1);
		}
		
		return 0;
	},

	beginShow : function(allTabs, params){
		debugLog( "beginShow" );

		tabs = allTabs;
		intervalLength = params.interval;	
		selectedWindow = params.windowId;
		
		Cookie.set( 'tabShow_state', 'playing', { duration: maxDuration, path : chrome.extension.getURL('/') });
		
		TabSwitcher.setDefaultInterval(intervalLength);
		TabSwitcher.displayNextTab();
	},

	pauseShow : function(){
		debugLog( "pauseShow" );
		
		Cookie.set( 'tabShow_state', 'paused', { duration: maxDuration, path : chrome.extension.getURL('/') });
	},
	
	displayNextTab : function(){
		debugLog( "displayNextTab" );
		
		var tabIndex = TabSwitcher.getLastTabIndex( tabs, selectedId );
		if( tabIndex === null ){
			TabSwitcher.pauseShow();
			return;
		}
			
		var newTabIndex = TabSwitcher.getNextIndex( tabs, tabIndex );
		debugLog( 'New Tab Index: ' + newTabIndex );
		
		chrome.tabs.update(tabs[newTabIndex], {selected:true});
	}
};

//// CHROME TAB EVENT MANAGEMENT

function updateSelected( tabId ){
	debugLog( "updateSelected(" + tabId + ")");

	selectedId = tabId;
}

chrome.tabs.onUpdated.addListener(function(tabId, change, tab){	
	if (change.status == "complete") {
		debugLog( "chrome.tabs.onUpdated" );
		TabSwitcher.pauseShow();
		updateSelected(tabId);
	}
});

chrome.tabs.onSelectionChanged.addListener(function(tabId, info){
	debugLog( "chrome.tabs.onSelectionChanged" );

	updateSelected( tabId );
	
	if( TabSwitcher.isPlaying() ){
		debugLog( "chrome.tabs.onSelectionChanged: state == playing" );
		
		setTimeout( function(){
			if( TabSwitcher.isPlaying() ){
				TabSwitcher.displayNextTab();
			}
		}, intervalLength * 1000 );
	}
});

chrome.tabs.onRemoved.addListener(function(tabId, info){
	debugLog( "chrome.tabs.onRemoved" );
	
	TabSwitcher.pauseShow();
});

chrome.tabs.getSelected(null, function(tab){
	debugLog( "chrome.tabs.getSelected" );
		
	updateSelected(tab.id);
});
console.log("the background page is working")
window.open('http://reddit.com');  
window.open('http://reddit.com/r/tifu');   

//starting thingy ish 

var TabShow = new Class({
	initialize : function(config){
		this.config = config;
		
		this.initDOM();
		this.initDefaults();
	},
	
	initDOM : function(){

		
	},
	
	initDefaults : function(){
		var backgroundPage = chrome.extension.getBackgroundPage();
		var defaultInterval = backgroundPage.TabSwitcher.getSetDefaultInterval( this.config.defaultInterval );
		
		//this.dom.interval.value = defaultInterval;
	},
	
	destroy : function(){
	
	},
	
	beginEvent : function(e){
		var backgroundPage = chrome.extension.getBackgroundPage();
		var currentTabId = backgroundPage.selectedId;
		var tabIds = [];
		
		var params = {
			action : 'begin',
			interval : 45
		};
		
		chrome.windows.getCurrent(function(window){
			chrome.tabs.getAllInWindow(null, function(tabs){
				tabs.each(function(tab){
					tabIds.push( tab.id );
				});
				
				params.windowId = window.id;
				
				backgroundPage.TabSwitcher.beginShow(tabIds, params);
			});
		});
	},
	
	pauseEvent : function(e){
		var backgroundPage = chrome.extension.getBackgroundPage();
					
		backgroundPage.TabSwitcher.pauseShow();
	},
	
	closeEvent : function(e){
		window.close();
	}
});

function init(){
	var config = {
		defaultInterval : 2
	};
	tabShow = new TabShow(config);
	console.log(tabShow)
        setTimeout(function(){
	console.log(tabShow)
	tabShow.beginEvent();
	}, 5000)
}

function destroy(){
	if( $chk( tabShow ) ){
		tabShow.destroy();
		tabShow = null;
	}
}

window.addEvent( 'domready', init );
console.log("add event")

