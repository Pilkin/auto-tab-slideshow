var TabShow = new Class({
	initialize : function(config){
		this.config = config;
		
		this.initDOM();
		this.initDefaults();
	},
	
	initDOM : function(){
		this.dom = {
			form : $('intervalForm'),
			begin : $('begin'),
			pause : $('pause'),
			close : $('close'),
			interval : $('interval')
		};
		
		this.dom.begin.addEvent('click', this.beginEvent.bindWithEvent(this));
		this.dom.pause.addEvent('click', this.pauseEvent.bindWithEvent(this));
		this.dom.close.addEvent('click', this.closeEvent.bindWithEvent(this));
	},
	
	initDefaults : function(){
		var backgroundPage = chrome.extension.getBackgroundPage();
		var defaultInterval = backgroundPage.TabSwitcher.getSetDefaultInterval( this.config.defaultInterval );
		
		this.dom.interval.value = defaultInterval;
	},
	
	destroy : function(){
	
	},
	
	beginEvent : function(e){
		var backgroundPage = chrome.extension.getBackgroundPage();
		var currentTabId = backgroundPage.selectedId;
		var tabIds = [];
		
		var params = {
			action : 'begin',
			interval : parseInt(this.dom.interval.value, 10)
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

