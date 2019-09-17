import { Component } from '@angular/core';
import { ViewChild } from '@angular/core';
import { } from '@types/googlemaps';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild('gmap') gmapElement: any;
  map: google.maps.Map;
  editMode: boolean;
  title='app';
  
  ngOnInit() {
	this.editMode = false;
	var mapProp = {
      center: new google.maps.LatLng(40.745391, -74.032384),
      zoom: 14,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
	
	//Load static FPA GeoJSON - TODO: load from Geoserver
	var hobokenFPA = '{"type":"FeatureCollection","totalFeatures":1,"features":[{"type":"Feature","id":"fpa.23254","geometry":{"type":"MultiPolygon","coordinates":[[[[-74.043781,40.739849,0],[-74.043674,40.740008,0],[-74.043481,40.740151,0],[-74.043474,40.740156,0],[-74.043282,40.74052,0],[-74.043256,40.740546,0],[-74.043192,40.740613,0],[-74.04309,40.740689,0],[-74.042958,40.74082,0],[-74.042951,40.740826,0],[-74.042806,40.740945,0],[-74.042778,40.740969,0],[-74.04277,40.740975,0],[-74.042688,40.741027,0],[-74.042544,40.741117,0],[-74.042514,40.741136,0],[-74.042412,40.7412,0],[-74.042378,40.741216,0],[-74.042374,40.741219,0],[-74.042343,40.741236,0],[-74.042313,40.741256,0],[-74.042299,40.741266,0],[-74.042252,40.741307,0],[-74.042215,40.74135,0],[-74.042185,40.741396,0],[-74.042164,40.741445,0],[-74.042152,40.741485,0],[-74.042147,40.741518,0],[-74.042146,40.741527,0],[-74.042146,40.741532,0],[-74.042146,40.741547,0],[-74.042146,40.741568,0],[-74.04215,40.74159,0],[-74.042252,40.74212,0],[-74.042325,40.742502,0],[-74.042297,40.742744,0],[-74.042289,40.742858,0],[-74.042271,40.742968,0],[-74.042243,40.743088,0],[-74.042206,40.743207,0],[-74.04216,40.743323,0],[-74.042106,40.743438,0],[-74.042047,40.743542,0],[-74.041981,40.743644,0],[-74.041908,40.743742,0],[-74.041828,40.743838,0],[-74.041741,40.74393,0],[-74.041648,40.744019,0],[-74.041606,40.744065,0],[-74.04157,40.744115,0],[-74.041543,40.744168,0],[-74.041523,40.744219,0],[-74.041511,40.744272,0],[-74.041506,40.744325,0],[-74.041505,40.744334,0],[-74.041505,40.744335,0],[-74.041497,40.744424,0],[-74.041482,40.744582,0],[-74.04148,40.744589,0],[-74.041477,40.744596,0],[-74.041473,40.744603,0],[-74.041467,40.744609,0],[-74.04146,40.744615,0],[-74.041452,40.744619,0],[-74.041427,40.744632,0],[-74.041405,40.744646,0],[-74.041299,40.744711,0],[-74.041276,40.744745,0],[-74.041193,40.744861,0],[-74.041125,40.74495,0],[-74.041036,40.745062,0],[-74.040961,40.74515,0],[-74.040877,40.745238,0],[-74.040789,40.745333,0],[-74.040678,40.745447,0],[-74.040647,40.745471,0],[-74.040609,40.745491,0],[-74.040568,40.745573,0],[-74.040407,40.745748,0],[-74.040252,40.745925,0],[-74.040165,40.74603,0],[-74.04008,40.746137,0],[-74.039999,40.746244,0],[-74.039876,40.746415,0],[-74.039759,40.746589,0],[-74.039618,40.746689,0],[-74.039641,40.746717,0],[-74.039643,40.74676,0],[-74.039301,40.747296,0],[-74.038968,40.747872,0],[-74.039003,40.747888,0],[-74.038907,40.748077,0],[-74.038644,40.748428,0],[-74.038346,40.749014,0],[-74.038325,40.749125,0],[-74.038289,40.749205,0],[-74.038063,40.749701,0],[-74.037933,40.749921,0],[-74.037919,40.749939,0],[-74.037855,40.750026,0],[-74.037716,40.750214,0],[-74.037684,40.750257,0],[-74.037085,40.751202,0],[-74.036374,40.752333,0],[-74.034885,40.754701,0],[-74.034185,40.755901,0],[-74.033585,40.756901,0],[-74.032485,40.758601,0],[-74.032485,40.759201,0],[-74.032287,40.759106,0],[-74.031276,40.758855,0],[-74.031103,40.758826,0],[-74.030815,40.758789,0],[-74.030291,40.758726,0],[-74.029824,40.758696,0],[-74.029385,40.758101,0],[-74.029085,40.757701,0],[-74.028285,40.758001,0],[-74.028085,40.757801,0],[-74.027585,40.757501,0],[-74.027385,40.757301,0],[-74.025885,40.757201,0],[-74.022685,40.757101,0],[-74.021084,40.757101,0],[-74.013784,40.756602,0],[-74.01387,40.756271,0],[-74.01389,40.756198,0],[-74.013906,40.756135,0],[-74.01548,40.750102,0],[-74.016784,40.745102,0],[-74.01825,40.739118,0],[-74.020405,40.730321,0],[-74.026185,40.732402,0],[-74.028985,40.733302,0],[-74.029268,40.733681,0],[-74.032235,40.734523,0],[-74.033573,40.734903,0],[-74.035598,40.735478,0],[-74.036933,40.735857,0],[-74.038572,40.736322,0],[-74.038573,40.736316,0],[-74.03859,40.736321,0],[-74.038596,40.736322,0],[-74.038607,40.736245,0],[-74.03865,40.736251,0],[-74.038782,40.736272,0],[-74.038791,40.736273,0],[-74.039144,40.736306,0],[-74.039604,40.736406,0],[-74.040246,40.73631,0],[-74.040255,40.736309,0],[-74.040475,40.736286,0],[-74.040514,40.736281,0],[-74.040534,40.736278,0],[-74.040653,40.73626,0],[-74.040774,40.736242,0],[-74.040992,40.73621,0],[-74.041057,40.736201,0],[-74.041151,40.736187,0],[-74.041247,40.736173,0],[-74.041336,40.73616,0],[-74.041428,40.736146,0],[-74.041518,40.736133,0],[-74.041607,40.73612,0],[-74.0417,40.736106,0],[-74.041792,40.736093,0],[-74.041863,40.736082,0],[-74.041882,40.73608,0],[-74.041903,40.736077,0],[-74.042686,40.735971,0],[-74.042821,40.735953,0],[-74.042819,40.735999,0],[-74.04281,40.736175,0],[-74.042808,40.736191,0],[-74.042815,40.73622,0],[-74.042854,40.736401,0],[-74.042742,40.736604,0],[-74.042904,40.736746,0],[-74.043193,40.737,0],[-74.043195,40.737002,0],[-74.043581,40.737275,0],[-74.043662,40.737412,0],[-74.043806,40.737539,0],[-74.043872,40.737597,0],[-74.043801,40.737719,0],[-74.04378,40.737755,0],[-74.043726,40.737874,0],[-74.043709,40.737912,0],[-74.043559,40.738171,0],[-74.043505,40.738263,0],[-74.043375,40.738478,0],[-74.04342,40.738501,0],[-74.0435,40.738557,0],[-74.043558,40.738599,0],[-74.043575,40.738621,0],[-74.04363,40.738694,0],[-74.043639,40.738706,0],[-74.04372,40.738815,0],[-74.043752,40.738857,0],[-74.043765,40.739106,0],[-74.04378,40.739399,0],[-74.043783,40.739459,0],[-74.043781,40.739849,0]]]]},"geometry_name":"the_geom","properties":{"DISTRICT_U":"NJ HOBOKEN","STATE":"NJ","COUNTY_FIP":"017","DISTRICT":"HOBOKEN","UNIQUE_IDE":"","NB_FLAG":"","PPC_LOW":"2","PPC_HIGH":"","WATER_FLAG":"S","EFF_DATE":"02/01/2017","STATE_SPEC":"263","SUBSCRIPTI":"","GOODNESS":"11","GEO_CHG_DA":"10/01/2015","NUMBER_OF_":"4","UD_NOTES":"","FD_CITY":"","ROADBASE":"","MEMO":"","GCR_ID":"NJ10092783"}}],"crs":{"type":"name","properties":{"name":"urn:ogc:def:crs:EPSG::4326"}}}';
	var geojson = JSON.parse(hobokenFPA);
	let data = this.map.data;
	data.addGeoJson(geojson);
	data.setMap(this.map);
    //this.map.data.addGeoJson(geojson);
	/* this.map.data.loadGeoJson('http://cpmaps.veriskt.com:8080/geoserver/uw/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=uw:fpa&maxFeatures=50&CQL_FILTER=GCR_ID=%27NJ10092783%27&outputFormat=application%2Fjson');*/
	
	data.setStyle({
		fillOpacity: 0,
		strokeColor: 'blue'
	});
	
	var deleteMenu = new DeleteMenu();

	data.addListener('rightclick', event => {
		if (event.vertex == undefined) {
		return;
	  }
	  deleteMenu.open(map, data.getPath(), event.vertex);
	});	
  }
  
  
  private _editFPA() {
    this.editMode = true;
	this.map.data.setStyle({
		editable: true,
		clickable: true,
		fillOpacity: 0.2,
		strokeColor: 'red'
	});
	
	this.map.data.toGeoJson(function (data) {
		console.log(data);
	});	
  }
  
  function DeleteMenu() {
	this.div_ = document.createElement('div');
	this.div_.className = 'delete-menu';
	this.div_.innerHTML = 'Delete';

	var menu = this;
	google.maps.event.addDomListener(this.div_, 'click', function() {
	  menu.removeVertex();
	});
  }
  DeleteMenu.prototype = new google.maps.OverlayView();

  DeleteMenu.prototype.onAdd = function() {
	var deleteMenu = this;
	var map = this.getMap();
	this.getPanes().floatPane.appendChild(this.div_);

	// mousedown anywhere on the map except on the menu div will close the
	// menu.
	this.divListener_ = google.maps.event.addDomListener(map.getDiv(), 'mousedown', function(e) {
	  if (e.target != deleteMenu.div_) {
		deleteMenu.close();
	  }
	}, true);
  };

  DeleteMenu.prototype.onRemove = function() {
	google.maps.event.removeListener(this.divListener_);
	this.div_.parentNode.removeChild(this.div_);

	// clean up
	this.set('position');
	this.set('path');
	this.set('vertex');
  };

  DeleteMenu.prototype.close = function() {
	this.setMap(null);
  };

  DeleteMenu.prototype.draw = function() {
	var position = this.get('position');
	var projection = this.getProjection();

	if (!position || !projection) {
	  return;
	}

	var point = projection.fromLatLngToDivPixel(position);
	this.div_.style.top = point.y + 'px';
	this.div_.style.left = point.x + 'px';
  };

  /**
   * Opens the menu at a vertex of a given path.
   */
  DeleteMenu.prototype.open = function(map, path, vertex) {
	this.set('position', path.getAt(vertex));
	this.set('path', path);
	this.set('vertex', vertex);
	this.setMap(map);
	this.draw();
  };

  /**
   * Deletes the vertex from the path.
   */
  DeleteMenu.prototype.removeVertex = function() {
	var path = this.get('path');
	var vertex = this.get('vertex');

	if (!path || vertex == undefined) {
	  this.close();
	  return;
	}

	path.removeAt(vertex);
	this.close();
  };
}