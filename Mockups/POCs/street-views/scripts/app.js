
// Define the `interactiveApp` module
var app = angular.module('streetViewApp', ['ui.bootstrap']);

app.constant('googleApikey', 'AIzaSyDocE2c2EtTdqz1KHLQka_GYEA9pHhnmgY')
   .constant('melissaApi', 'http://underwritingapit-internal-scrubber.iso.com')
   //.constant('melissaApi', 'http://ipvapw7d-a823.iso.com')
   .constant('path', window.location.href);



app.factory('datasource', function($http, $q, path, googleApikey, melissaApi) {
  var factory = {};

  var csvToJson = function(data) {
    var lines = data.split("\n"), prop, result= [];
    lines.forEach(function(line) {
        var items = line.split(/(?!\B"[^"]*),(?![^"]*"\B)/g),
            obj = {};
        if (!prop || !prop.length) {
            prop = items.map(function(i){return i.toLowerCase();})
        }
        else {
            for (var i = 0; i < items.length; i++) {
                obj[prop[i]] = items[i];
            }
            result.push(obj);
        }
    });
    return result;
  };

  var buildAddress = function(arr){
    return arr.map(function(i){
      var res = {
        street: i['street addr'],
        city: i['city'],
        state: i['state'],
        zip: i['zip c'],
        risk: i['risk id']
      };
      res.formatted_address = `${res.street} ${res.city} ${res.state} ${res.zip}`.trim().replace(/\s\s+/g, ' ');
      return res;
    });
  };

  var buildGoogleMarker = function(lat,lng, label, color){
     var pipe;
     if(!lat || !lng) return "";
     label = label? `label:${label}`: "";
     color = color? (label && '|') + `color:${color}`: "";
     pipe = (label || color) && "|";
     return `&markers=${label}${color}${pipe}${lat},${lng}`;
  };

  var calcZoom = function(ne, sw, pixelWidth){
    if(!sw || !sw.lng || !ne || !ne.lng) return;
    const GLOBE_WIDTH = 256; // a constant in Google's map projection
    var west = sw.lng;
    var east = ne.lng;
    var angle = east - west;
    console.log(angle);
    if (angle < 0) { angle += 360; }
    var zoom = Math.round(Math.log(pixelWidth * 360 / angle / GLOBE_WIDTH) / Math.LN2);
    if(zoom < 13) return 13;
    else if(zoom > 20) return 20;
    else return zoom;
  }; 

  var getStreetView = function(lat,lng){
    if(!lat || !lng) return "";
    return `https://maps.googleapis.com/maps/api/streetview?size=700x400&source=outdoor&radius=300&key=${googleApikey}&location=${lat},${lng}`;
  };

  var addresses = $http.get('/data/addresses.csv').then(function(res){
    var json = csvToJson(res.data);
    return buildAddress(json);
  });

  var getMapUrl = function(address){
    if(!address.google && !address.melissa) return "";
    var zoom = calcZoom(address.google, address.melissa, 600) || "";
    return `https://maps.googleapis.com/maps/api/staticmap?size=600x400&zoom=${zoom}&maptype=hybrid&key=${googleApikey}${address.google && address.google.marker || ""}${address.melissa && address.melissa.marker || ""}`;
   };


  factory.getGoogleGeocodes = function(addresses){
    addresses.forEach(function(i){
      var url = `https://maps.googleapis.com/maps/api/geocode/json?address=${i.formatted_address}&key=${googleApikey}`;
      i.response = i.response || {};
      i.response.google = $http.get(url).then(function(response){
         var res = response.data && response.data.results && response.data.results.length && response.data.results[0];
         var geometry = res && res.geometry;
         i.google = location? {
             lat: geometry.location && geometry.location.lat,
             lng: geometry.location && geometry.location.lng,
             type: geometry && geometry.location_type
           }: {};
          i.google.marker = buildGoogleMarker(i.google.lat, i.google.lng, "G", "0xff6b42");
          i.google.streetView = getStreetView(i.google.lat, i.google.lng);
         //i.googleStreetView = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${i.google.lat},${i.google.lng}&heading=90&pitch=0&key=${googleApikey}`
         return res;
      }).catch(function(e){ console.error(e);});
    });
    return addresses;
  };


   factory.getMelissaGeocodes = function(addresses){
    addresses.forEach(function(i){
      var url = `${melissaApi}/scrubber/address/geocode?applicationId=Prometrix&address.address1=${(i.street || "").replace(/\s/g, '+')}&address.city=${(i.city || "").replace(/\s/g, '+')}&address.state=${(i.state || "").replace(/\s/g, '+')}&address.zip=${(i.zip || "").replace(/\s/g, '+')}`;
     i.response = i.response || {};
     i.response.melissa = $http.get(url).then(function(res){
         res = res.data;
         if(!res) return res;
         i.melissa = res? {
             lat: res && res.Latitude,
             lng: res && res.Longitude
           }: {};
         i.melissa.marker = buildGoogleMarker(i.melissa.lat, i.melissa.lng, "M", "0x01d3ff");
         i.melissa.streetView = getStreetView(i.melissa.lat, i.melissa.lng);
         return res;
      }).catch(function(e){ console.error(e);});     
    });
    return addresses;
  };



  var plot = function(markers, zoom, width){
    var markers = markers.join('');
    width = width || 600;
    zoom = zoom || "";
    return `https://maps.googleapis.com/maps/api/staticmap?size=${width}x400&zoom=${zoom}&maptype=hybrid&key=${googleApikey}${markers}`
  };
  

  factory.plotMap = function(addresses){
    var mapWith = 600;
    var url = `https://maps.googleapis.com/maps/api/staticmap?size=${mapWith}x400`;
    addresses.forEach(function(i){
      $q.all([i.response.google, i.response.melissa]).then(res => {
        i.defaultZoom  = i.zoom = calcZoom(i.google, i.melissa, mapWith);
        i.mapUrl = plot([i.google.marker, i.melissa.marker], i.defaultZoom, mapWith); //`https://maps.googleapis.com/maps/api/staticmap?size=600x400&zoom=${zoom}&maptype=hybrid&key=${googleApikey}${i.google.marker || ""}${ i.melissa.marker || ""}`;
      });
     });
    return addresses;
  };

  factory.reverse = function(res){
    return res.reverse();
  };

  factory.pick = function(n){
    return function(arr) {
      var result = [];
      if(!arr || !arr.length || !n || n > arr.length) {  return arr; }
      for (var i = 0; i < n; i++) {
         result.push(arr[i]);
      }
      return result;
    };
  };


  /*factory.get = function(count){
    return addresses.then(function(res){
       var result = [];

       if(!res || !res.length) {return res; }
       else if(!count){ count = 1; } // remove before deploying
       else if (!count || count > res.length) { return res; }// uncomment for deployment

       for (var i = 0; i < count; i++) {
         result.push(res[i]);
       }
       return result;
    });
  };*/

  factory.get = function(){
    return addresses;
  };

  factory.calcZoom = calcZoom;
  factory.plot = plot;

  return factory;
});


// Define the `bopController` controller on the `phonecatApp` module
app.controller('ctrl', function($scope, $uibModal, datasource, $q, googleApikey) {

  var pick = datasource.pick,
      reverse = datasource.reverse;

  var range = function(min, max, number){
    if(number < min) return min;
    else if(number > max)return max;
    return number;
  };

  var zoomTo = function(address, level){
     var min, max;
     if(!level) return;
     else if(level == 'out') { 
      min = Math.min(14, address.defaultZoom);
      zoom_to = range(min, address.defaultZoom, address.zoom-1);  
    }
     else if(level == 'in') {  
      max = Math.max(22, address.defaultZoom);
      zoom_to = range(address.defaultZoom, max, address.zoom+1);
    } 
    else {
      zoom_to = level;
    }
     address.mapUrl = datasource.plot([address.google && address.google.marker, address.melissa && address.melissa.marker], zoom_to);
     address.zoom = zoom_to;
   };

  $scope.api_key = googleApikey;
   datasource.get()
   .then(pick(1))
   //.then(reverse)
   .then(datasource.getGoogleGeocodes)
   .then(datasource.getMelissaGeocodes)
   .then(datasource.plotMap)
   .then(function(res){
     $scope.addresses = res;
     console.log(res);
   }); //*/


   /*datasource.get(1)
   //.then(datasource.pick(2))
   .then(datasource.getGoogleGeocodes)
   .then(datasource.getMelissaGeocodes)
   .then(datasource.plotMap)
   .then(function(res){
     //$scope.addresses = res;
     console.log(res);
   }); //*/


   $scope.zoomTo = zoomTo;

});
