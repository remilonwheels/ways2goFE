'use strict';

require('./_edit-way.scss');

module.exports = {
  template: require('./edit-way.html'),
  controller: ['$log', '$mdDialog', '$mdToast','wayService', 'way', 'profileService', '$scope', EditWayController],
  controllerAs: 'editWayCtrl'
};

function EditWayController($log, $mdDialog, $mdToast, wayService, way, profileService, $scope) {
  this.way = wayService.getOneWay(way._id);
  this.waySubmit = {};

  const addPropToForm = (prop) => {
    if ( prop === 'oneTimeDate') {
      this.waySubmit[prop] = new Date(this.way[prop]);
      return;
    }

    if (
      prop === 'hour'
    ) {
      if (this.way[prop] > 12) {
        this.hour12 = this.way[prop] - 12;
        this.ampm = 'pm';
        return;
      } else {
        this.ampm = 'am';
        this.hour12 = this.way[prop];
        return;
      }
    }

    this.waySubmit[prop] = this.way[prop];
    return;
  };

  for (let prop in this.way) {
    addPropToForm(prop);
  }

  console.log('waysubit init', this.waySubmit);
  this.startLocation = displayLocation(way.startLocation);
  this.endLocation = displayLocation(way.endLocation);

  this.daysOfWeek = ['M', 'T', 'W', 'R', 'F', 'Sa', 'Su'];
  this.isPM = true;
  const dayMap = { M: 0, T: 1, W: 2, R: 3, F: 4, Sa: 5, Su: 6 };

  console.log('this in edit load', this);

  this.isLoading = false;
  this.isLoadingDelete = false;

  this.wayerToAdd = null;
  this.allProfiles = null;
  this.loadAllProfiles = function() {
    profileService.fetchAllProfiles()
    .then( profiles => {
      this.allProfiles = profiles;
    })
    .catch( err => $log.debug(err));
  };

  this.addWayerSubmit = function() {
    this.isLoadingWayer = true;

    wayService.addWayer(this.way._id, this.wayerToAdd._id)
    .then( wayer => {
      $mdToast.showSimple(`Added Wayer Successfully`);
      this.isLoadingWayer = false;
      $scope.$emit('wayModify');
      $mdDialog.hide();
    });
  };

  this.deleteWaySubmit = function() {
    this.isLoadingDelete = true;

    wayService.deleteWay(this.way._id)
    .then( res => {
      console.log(res);
      $mdToast.showSimple('Deleted Way Successfully');
      this.isLoading = false;

      $mdDialog.hide();
    })
    .catch( err => {
      $mdToast.showSimple(err.data);
      this.isLoading = false;
    });
  };

  this.editWaySubmit = function() {
    this.isLoading = true;

    if (this.hour12) {
      this.waySubmit.hour = this.hour12;
      if (this.ampm === 'pm') {
        this.waySubmit.hour += 12;
      }
    }

    this.waySubmit.startLocation = this.startLocation;
    this.waySubmit.endLocation = this.endLocation;

    console.log('this.way before api call', this.waySubmit);

    wayService.editWay(this.waySubmit)
    .then( res => {
      console.log(res);
      $mdToast.showSimple('Changed Way Successfully');
      this.isLoading = false;

      $scope.$emit('wayModify');
      $mdDialog.hide();
    })
    .catch( err => {
      $mdToast.showSimple(err.data);
      this.isLoading = false;
    });

    $log.log(this.way);
  };

  this.closeDialog = function() {
    $mdDialog.hide();
  };

  this.exists = function (item, list) {
    return list.indexOf(dayMap[item]) > -1;
  };

  this.toggle = function (item, list) {
    var idx = list.indexOf(dayMap[item]);
    if (idx > -1) {
      list.splice(idx, 1);
    }
    else {
      list.push(dayMap[item]);
    }
  };


}

function displayLocation({number, street, city, state}) {
  return `${number} ${street ? street : ''} ${city}, ${state}`;
}
