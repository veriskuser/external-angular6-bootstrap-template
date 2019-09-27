
// Define the `interactiveApp` module
var app = angular.module('streetViewApp', ['ui.bootstrap']);

app.constant('googleApikey', '<INSERT KEY HERE>')
   .constant('melissaApi', 'http://underwritingapit-internal-scrubber.iso.com')
  // .constant('melissaApi', 'http://internal-scrub-api-prod1-2012086553.us-east-1.elb.amazonaws.com')
   .constant('path', window.location.href);

app.factory('googleMapsInitializer', function($window, $q, googleApikey) {
        // maps loader deferred object
        var mapsDefer = $q.defer();

        // Google's url for async maps initialization accepting callback function
        var asyncUrl = `https://maps.googleapis.com/maps/api/js?key=${googleApikey}&callback=`;
        //var asyncUrl = `https://maps.googleapis.com/maps/api/js?client=gme-insuranceservices2&channel=ProMetrix&v=3&callback=`;

        // async loader
        var asyncLoad = function(asyncUrl, callbackName) {
          var script = document.createElement('script');
          //script.type = 'text/javascript';
          script.src = asyncUrl + callbackName;
          document.body.appendChild(script);
        };

        // callback function - resolving promise after maps successfully loaded
        $window.googleMapsInitialized = function () {
            mapsDefer.resolve();
        };

        // loading google maps
        asyncLoad(asyncUrl, 'googleMapsInitialized');

        return {
            // usage: Initializer.mapsInitialized.then(callback)
            initialized : mapsDefer.promise
        };
    });

/*
app.directive("readFile", [function () {
        return {
            scope: {
                readFile: "=readFile"
            },
            link: function (scope, element, attributes) {
                element.bind("change", function (changeEvent) {
                    var reader = new FileReader();
                    reader.onload = function (loadEvent) {
                        scope.$apply(function () {
                            scope.readFile(loadEvent.target.result);
                        });
                    }
                    reader.readAsText(changeEvent.target.files[0]);
                });
            }
        }
    }]);
//*/

app.directive('plotMap', function (googleMapsInitializer, $q) {
      return {
          restrict: 'A',
          scope: {
            plotMap: "="
          },
          link: function (scope, $element, $attrs) {
            var response = scope.plotMap.response;
            var promises = [googleMapsInitializer.initialized,response.melissa, response.google];

            $q.all(promises).then(() => {
                var bounds = new google.maps.LatLngBounds();

                var map = new google.maps.Map($element[0], {
                  mapTypeId: google.maps.MapTypeId.ROADMAP,
                });

                var markers = scope.plotMap.markers.map(i => {
                  var marker = new google.maps.Marker({
                    position: i,
                    map: map,
                    label: i.source.toUpperCase()[0]
                  });

                  bounds.extend(marker.getPosition());
                  return marker;
                });

                 map.fitBounds(bounds);
            });
          }
      };
  });

app.factory('datasource', function($http, $q, $timeout, googleMapsInitializer, path, googleApikey, melissaApi) {
  var factory = {};

  const googleMapWidth = "1950";

  var csvToJson = function(data) {
    var lines = data.split("\r\n"), prop, result= [];
    lines.forEach(function(line) {
        var items = line.split(/(?!\B"[^"]*),(?![^"]*"\B)/g);
        let obj = {};
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

  var toAddressObject = (res) => {
    if(!res.map) return res;
    return res.map(function(i){
      var res = {
        street: i['street addr'],
        city: i['city'],
        state: i['state'],
        zip: i['zip c'],
        risk: i['risk id'].trim()
      };
      res.formatted_address = `${res.street} ${res.city} ${res.state} ${res.zip}`.trim().replace(/\s\s+/g, ' ');
      return res;
    });
  };


  var addresses = $http.get('data/addresses.csv').then(res => {
    return csvToJson(res.data);
  }).then(toAddressObject);

  /*var addresses = $http.get('data/fr_input_geocode_200_sample.csv').then(res => { //'data/addresses.csv'
    return csvToJson(res.data);
  }).then(res => {
    return res.map(function(i){
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
  });*/

  var prometrix_geocodes = $http.get('data/prometrix-geocodes.csv').then(res => {
    return csvToJson(res.data);
  }).then(res => {
    var type = {
      'FR': 'Geocode Source 2 (FR Input)',
      'GP': 'Coordinate Locked in - Front of Bldg',
      'FS': 'Coordinate Correction - to Center of Bldg',
      'FT': 'Coordinate Correction - Building not on image'
    };
    return res.map(i => {
      return {
        risk: i.risk.trim(),
        latitude: i.n_lat,
        longitude: i.n_lon,
        type: i.c_mtch_typ,
        typeDescription: type[i.c_mtch_typ]
      };
    });
  }).then(res => {
    return res.filter(i => {return i.type == "FS"} );
  });


  var getMapUrl = function(address){
    if(!address.google && !address.melissa) return "";
    var zoom = calcZoom(address.google, address.melissa, 600) || "";
    return `https://maps.googleapis.com/maps/api/staticmap?size=600x400&zoom=${zoom}&maptype=hybrid&key=${googleApikey}${address.google && address.google.marker || ""}${address.melissa && address.melissa.marker || ""}`;
   };

  factory.getGoogleGeocodes = function(addresses){
    var geocode = (geocoder, address, deferred, index, delay) => {
      geocoder.geocode({
            'address': address.formatted_address
          },
          (results, status) => {
              if (status == google.maps.GeocoderStatus.OK) {
                 //results[0].geometry.location
                 var geometry = results[0].geometry, marker;
                 address.google = {};
                 if(geometry && geometry.location) {
                  marker = {
                    lat: geometry.location.lat(),
                    lng: geometry.location.lng(),
                    type: geometry.location_type,
                    source: 'google',
                    color: "0xff6b42"
                  };
                  address.markers = address.markers || [];
                  address.markers.push(marker);
                  address.google.streetView = getStreetView(marker.lat, marker.lng);
                }
                 if(!marker) { address.google = { error: "No Lat/Lng found for this property" }; }

                 deferred.resolve(results[0].geometry);
                 //console.log(`${index}. ${address.formatted_address} delayed for ${delay}`);
              } else {
                  //console.log(`Google geocode of ${address.formatted_address} failed: ${status}`);
                  console.error(`${index}. ${address.formatted_address}`);
              }
          });
    };

    addresses.forEach((i, index) => {
       var deferred = $q.defer();
       googleMapsInitializer.initialized.then(() => {
         var geocoder = new google.maps.Geocoder();
         var delay = 4000 * Math.floor(index/5);
         setTimeout(geocode, delay, geocoder, i, deferred, index, delay);
     });
     i.response = i.response || [];
     i.response.google = deferred.promise;
     });
     return addresses;
  };


   factory.getMelissaGeocodes = function(addresses){
    addresses.forEach(function(i){
    var url = `${melissaApi}/scrubber/address/geocode?applicationId=Prometrix&address.address1=${(i.street || "").replace(/\s/g, '+')}&address.city=${(i.city || "").replace(/\s/g, '+')}&address.state=${(i.state || "").replace(/\s/g, '+')}&address.zip=${(i.zip || "").replace(/\s/g, '+')}`;
    i.response = i.response || [];
    i.response.melissa = $http.get(url).then(function(res){
         let marker;
         res = res.data;
         i.melissa = {};
         if(res) {
           marker = {
              lat: parseFloat(res.Latitude),
              lng: parseFloat(res.Longitude),
              source: 'melissa',
              color: "0x01d3ff"
            };
           i.markers = i.markers || [];
           i.markers.push(marker);
           //i.melissa.marker = buildGoogleMarker(i.melissa.lat, i.melissa.lng, "M", "0x01d3ff");
           i.melissa.streetView = getStreetView(marker.lat, marker.lng);
         }
         if(!marker) { i.melissa.error =  "No Lat/Lng found for this property"; }
         return res;
      }).catch(function(err){
        i.melissa = { error: err };
        throw err;
      });
    });
    return addresses;
  };

  factory.getPrometrixGeocodes = function(addresses){
    return prometrix_geocodes.then(res => {
      addresses.forEach((i, index) => {
        var geocode = res.find(code => code.risk == i.risk), marker;
        i.prometrix = {};
        if(geocode){
          marker = {
             lat: parseFloat(geocode.latitude),
             lng: parseFloat(geocode.longitude),
             type: geocode.typeDescription,
             source: 'prometrix',
             color: "0x6ece4d"
           };
          i.markers = i.markers || [];
          i.markers.push(marker);
          i.prometrix.streetView = getStreetView(marker.lat, marker.lng);
        }

        if(!marker) {i.prometrix.error = "No Lat/Lng found for this property"; }
      });
      return addresses;
    });
  };

  factory.reverse = function(res){
    return res.reverse();
  };

  factory.pick = function(n, startAt){
    return function(arr) {
      var result = [];
      if(!startAt || startAt > arr.length) {  startAt = 0; }
      if(!n) { n = arr.length - startAt; }
      if(!arr || !arr.length) {  return arr; }

      for (var i = startAt || 0; (i < n+startAt && i < arr.length); i++) {
         result.push(arr[i]);
      }

      return result;
    };
  };

  factory.get = function(){
    return addresses;
  };

  factory.getFrom = function(text){
    return $q(function(resolve, reject) {
      setTimeout(function() {
        if (text) {
          resolve(text);
        } else {
          reject(text);
        }
      });
    }).then(csvToJson).then(toAddressObject);
  };

  factory.calcZoom = calcZoom;
  //factory.plot = plot;

  return factory;
});


// Define the `bopController` controller on the `phonecatApp` module
app.controller('ctrl', function($scope, $uibModal, datasource, $q, googleMapsInitializer) {

  var range = function(min, max, number){
    if(number < min) return min;
    else if(number > max)return max;
    return number;
  };

  var zoomTo = function(address, level){
    var zoom_to;
    if(level == 'in') {
      zoom_to = (address.zoom || 19) + 1;
    }
    else if(level == 'out') {
      zoom_to = (address.zoom || 17) - 1;
    }

    address.zoom = range(15, 21, zoom_to || 17);
    address.mapUrl = datasource.plot(address.formatted_address, [address.google && address.google.marker, address.melissa && address.melissa.marker, address.prometrix && address.prometrix.marker], address.zoom);
   };

  var pick = datasource.pick,
      reverse = datasource.reverse,
      geocodeUsingGoogle = datasource.getGoogleGeocodes,
      geocodeUsingMelissa = datasource.getMelissaGeocodes,
      geocodeUsingPrometrix = datasource.getPrometrixGeocodes,
      plotOnMap = datasource.plotMap;


  /* $scope.read = ($event) => {
    var $file = angular.element($event.target).parent().siblings('input');
    $file.click();
    console.log($file);
  };

  $scope.reader = (result) => {
    $scope.addresses = null;
    datasource.getFrom(result)
    .then(pick(1))
    .then(geocodeUsingGoogle)
    .then(geocodeUsingMelissa)
    //.then(geocodeUsingPrometrix)
    .then(function(res){
      $scope.addresses = res;
    });
  };
*/

  var render = () => {
    var count = parseFloat($scope.displayCount);
    $scope.addresses = null;
    datasource.get()
    .then((res) => {
      $scope.totalAddressCount = res.length;
      return res;
    })
    .then(pick(count))
    .then(geocodeUsingGoogle)
    .then(geocodeUsingMelissa)
    .then(geocodeUsingPrometrix)
    .then(function(res){
      console.log('render: $scope.addresses>> ', res);
      $scope.addresses = res;
    });
  };

  $scope.zoomTo = zoomTo;
  $scope.csvFile = null;
  $scope.displayCount = 1;
  $scope.totalAddressCount  = 0;
  $scope.reload = render;

  render();
});
