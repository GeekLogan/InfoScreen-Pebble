var UI = require('ui');
var ajax = require('ajax');
var Vector2 = require('vector2');

var parseFeed = function(data) {
    var items = [];
    var times = data.match(/<prdtm>(.*?)<\/prdtm>/);
    var routes = data.match(/<rt>(.*?)<\/rt>/);
    
    for(var i = 0; i < times.length && i < routes.length; i++) {    
        var title = routes[i].replace("<rt>", "").replace("</rt>", "");
        var time = times[i].replace("<prdtm>", "").replace("</prdtm>", "");

        // Add to menu items array
        items.push({
          title:title,
          subtitle:time
        });
  }
  return items;
};

var splashWindow = new UI.Window();
var text = new UI.Text({
    position: new Vector2(0, 0),
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

var key = "";

ajax(
  {
    url:'http://trip.osu.edu/bustime/api/v1/getpredictions?key=' + key + "&stpid=44",
    type:'text'
  },
  function(data) {
    var menuItems = parseFeed(data);

    var resultsMenu = new UI.Menu({
      sections: [{
        title: 'Current Busses',
        items: menuItems
      }]
    });

    resultsMenu.show();
    splashWindow.hide();
  },
  function(error) {
    console.log('Download failed: ' + error);
  }
);
