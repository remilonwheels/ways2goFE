'use strict';

require('./_waymap.scss');

const viewWayComponent = require('../../../dialog/way/view-way/view-way.js');

module.exports = {
  template: require('./waymap.html'),
  controller: ['$log', '$http', '$interval', 'NgMap', 'wayService', '$mdMedia', '$scope', '$mdDialog', WayMapController],
  controllerAs: 'wayMapCtrl',
  bindings: {
    ways: '<'
  }
};

function WayMapController($log, $http, $interval, NgMap, wayService, $mdMedia, $scope, $mdDialog) {
  $log.debug('WayMapController');

  //map config
  this.type = 'geocode';
  this.centerOnLoad = [ 47.618217, -122.351832 ];

  //map data
  const mapInit = () => {
    NgMap.getMap().then( map => {
      console.log('ng map init success', map);
      this.map = map;

      this.startMarkers = [];
      this.endMarkers = [];
      this.googlePaths = [];

      this.ways.forEach( way => {

        let startPos = new google.maps.LatLng(way.startLocation.lat, way.startLocation.lng);
        let endPos = new google.maps.LatLng(way.endLocation.lat, way.endLocation.lng);

        let bounds = new google.maps.LatLngBounds();
        bounds.extend(startPos);
        bounds.extend(endPos);
        this.map.fitBounds(bounds);

        let startMarker = new google.maps.Marker({
          map: this.map,
          position: startPos,
          wayID: way._id
        });

        let endMarker = new google.maps.Marker({
          map: this.map,
          position: endPos,
          wayID: way._id
        });

        let waypath = [
          {
            lat: way.startLocation.lat,
            lng: way.startLocation.lng
          },
          {
            lat: way.endLocation.lat,
            lng: way.endLocation.lng
          }
        ];

        let googlePath = new google.maps.Polyline({
          map: this.map,
          path: waypath,
          geodesic: true,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 2
        });

        this.startMarkers.push(startMarker);
        this.endMarkers.push(endMarker);
        this.googlePaths.push(googlePath);

        google.maps.event.addListener(startMarker, 'click', function() {
          let way = wayService.getOneWay(this.wayID);

          viewWay(event, true, way);
        });

        google.maps.event.addListener(endMarker, 'click', function() {
          console.log(this.wayID);

          let way = wayService.getOneWay(this.wayID);

          viewWay(event, true, way);
        });
      });
    });
  };

  this.drawWays = function() {
    //FINISH THIs
  };

  this.placeChanged = function() {
    // "this" inside function references the location entered in from the search bar
    setPlaceChange(this.getPlace());
  };

  const setPlaceChange = (place) => {
    this.place = place;
    this.map.setCenter(this.place.geometry.location);
  };


  this.wayClick = function(event) {
    console.log('event in wayclick', event);
    console.log('this in wayclick', this);
  };

  const viewWay = function ($event, bindFlag, way) {
    const dialogConfig = {
      fullscreen: !$mdMedia('gt-sm'),
      targetEvent: $event,
      scope: $scope.$new(bindFlag),
      resolve: {
        way: function() {
          return way;
        }
      },
    };
    $mdDialog.show(Object.assign(viewWayComponent, dialogConfig));
  };

  mapInit();
}
