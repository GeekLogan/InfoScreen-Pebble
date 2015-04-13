var UI = require('ui');
var ajax = require('ajax');
var Vector2 = require('vector2');

var timeParse = function(inputTime) {
    var year = inputTime.substring(0,4);
    var month = inputTime.substring(4,6);
    var day = inputTime.substring(6,8);
    var hour = inputTime.substring(9,11);
    var minute = inputTime.substring(12,14);
    
    var prediction = new Date(year, month, day, hour, minute);
    prediction.setMonth(prediction.getMonth() - 1);
    
    var one_minute = 60000; //the value of one minute in milliseconds
    var currentTimeMillis = (new Date()).getTime();
    var predictionTimeMillis = prediction.getTime();
    
    var timeDiff = predictionTimeMillis - currentTimeMillis;
    if(timeDiff < 0) timeDiff = 0;
    timeDiff /= one_minute;
    timeDiff = Math.round(timeDiff);
    
    if(timeDiff <= 1) {
        return " Arriving Now";  
    }
    
    return " " + timeDiff + " Minutes";
};

var splashWindow = new UI.Window();
var text = new UI.Text({
    position: new Vector2(0, 100),
    size: new Vector2(144, 168),
    text:'LOADING',
    font:'GOTHIC_28_BOLD',
    color:'black',
    textOverflow:'wrap',
    textAlign:'center',
    backgroundColor:'white'
});
splashWindow.add(text);
splashWindow.show();

var key = "scxhtGA7yzXPerqpsi8aQYXF2";

ajax(
    {
        url:'http://trip.osu.edu/bustime/api/v1/getroutes?key=' + key,
        type:'text'
    },
    function(data) {
        var items = [];
        var names = data.match(/<rtnm>(.*?)<\/rtnm>/g);
        var routes = data.match(/<rt>(.*?)<\/rt>/g);
        console.log(names.length);
        for(var i = 0; i < names.length && i < routes.length; i++) {    
            var title = names[i].replace("<rtnm>", "").replace("</rtnm>", "");
            var route = routes[i].replace("<rt>", "").replace("</rt>", "");
            
            // Add to menu items array
            items.push({
                title:title,
                subtitle:route
            });
        }
        
        var routesMenu = new UI.Menu({
            sections: [{
                title: 'Current Stops',
                items: items
            }]
        });
        
        routesMenu.on('select', function(e) {

//START LAYER 2
ajax(
    {
        url:'http://trip.osu.edu/bustime/api/v1/getstops?key=' + key + '&dir=Circular&rt=' + e.item.subtitle ,
        type:'text'
    },
    function(data2) {
        var items = [];
        var names = data2.match(/<stpnm>(.*?)<\/stpnm>/g);
        var routes = data2.match(/<stpid>(.*?)<\/stpid>/g);
        for(var i = 0; i < names.length && i < routes.length; i++) {    
            var title = names[i].replace("<stpnm>", "").replace("</stpnm>", "");
            var route = routes[i].replace("<stpid>", "").replace("</stpid>", "");
            
            // Add to menu items array
            items.push({
                title:title,
                subtitle:route
            });
        }
        
        var stopsMenu = new UI.Menu({
            sections: [{
                title: 'Stops',
                items: items
            }]
        });
        
        stopsMenu.on('select', function(c) {
            
//START LAYER 3
            
ajax(
    {
        url:'http://trip.osu.edu/bustime/api/v1/getpredictions?key=' + key + "&stpid=" + c.item.subtitle,
        type:'text'
    },
    function(data3) {
        var items = [];
        var times = data3.match(/<prdtm>(.*?)<\/prdtm>/g);
        var routes = data3.match(/<rt>(.*?)<\/rt>/g);
        for(var i = 0; i < times.length && i < routes.length; i++) {    
            var title = routes[i].replace("<rt>", "").replace("</rt>", "");
            var time = times[i].replace("<prdtm>", "").replace("</prdtm>", "");
            
            // Add to menu items array
            items.push({
                title:title,
                subtitle:timeParse(time)
            });
        }
        var resultsMenu = new UI.Menu({
            sections: [{
                title: 'Current Busses',
                items: items
            }]
        });
        resultsMenu.show();
        splashWindow.hide();
    },
    function(error) {
        console.log('Download failed: ' + error);
    }
);
            
//END LAYER 3
        });
        
        stopsMenu.show();
        splashWindow.hide();
    },
    function(error) {
        console.log('Download failed: ' + error);
    }
);
//END LAYER 2
            
        });
        
        routesMenu.show();
        splashWindow.hide();
    },
    function(error) {
        console.log('Download failed: ' + error);
    }
);
