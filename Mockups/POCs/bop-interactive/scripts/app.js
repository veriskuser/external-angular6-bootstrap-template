// Define the `interactiveApp` module
var app = angular.module('interactiveApp', ['ui.bootstrap']);

app.constant('path', window.location.href);

app.directive('isBusy', function (path) {
      return {
          restrict: 'A',
          scope: {
            useTemplate: "@use",
            isBusy: "=",
            includeWrapper: "@"
          },
          template: '<div ng-include="templateUrl"></div>',
          //templateUrl: path + 'template/oval.svg',
          link: function (scope, $element, $attrs) {
            var setWrapper = function(){
              if(!scope.includeWrapper) return;
              else if(scope.active) { $element.parent().removeClass('ng-hide'); }
              else { $element.parent().addClass('ng-hide'); }
            };

            scope.templateUrl = `${path}template/${ scope.useTemplate || "oval" }.svg`;
             scope.$watch('isBusy', function(newValue) {
               scope.active = newValue && typeof newValue.then === 'function';
               setWrapper();
               newValue.then(function(res){
                 scope.active = false;
                 setWrapper();
                 return res;
               },function(res){
                 scope.active = false;
                 setWrapper(res);
               });
             });
          }
      };
  });

// Define the `dataFactory` controller on the `phonecatApp` module
app.factory('datasource', function($http, $q, path) {
  var factory = {};

  var formatAddress = function(address){
     var zip = address.Zip4? `${address.Zip || ""}-${address.Zip4 || ""}`: address.Zip;
    return (`${address.StreetAddress1 || ""} ${address.City || ""} ${address.State || ""} ${zip || ""}` || "").trim().replace(/\s\s+/g, ' ');
  };

  var businesses = $http.get(path + 'data/search.json').then(function(res){
      var result = res.data && res.data.BopBusinesses;
      if(result){
          return result.map(function(i){
            var formatted_address = i.Address && formatAddress(i.Address);
            return {
              id: i.UniqueIdentifier,
              name: i.BusinessName.toLowerCase(),
              formatted_name: i.BusinessName,
              address_components: i.Address,
              formatted_address: formatted_address.toLowerCase()
            };
          });
      };
      return [];
  });

  var states = $http.get(path + 'data/states.json').then(function(res){
      return res.data;
  });

  var calculateQuote = $http.get(path + 'data/quote.json').then(function(res){
      return res.data;
  });


  var transformReport = function(r){
      var relativeCreditGrading, totalOshaViolations;

      if(r.Ms2.RelativeCreditGradings && r.Ms2.RelativeCreditGradings.length) {
          relativeCreditGrading = r.Ms2.RelativeCreditGradings.find(function(o){
             var result = o.GroupingCriterias.reduce(function(acc, cur) {
               acc.industry = acc.industry || (cur.GroupingName || "").toLowerCase().includes('industry');
               acc.numberOfEmployees = acc.numberOfEmployees || (cur.GroupingName || "").toLowerCase().includes('number of employees');
               return acc;
             }, {industry: false, numberOfEmployees: false});
             return result.industry && result.numberOfEmployees;
          });
      }

      if(r.Ms4.OshaInpectionsAndViolations){
        totalOshaViolations = r.Ms4.OshaInpectionsAndViolations.OshaResults.reduce(function(acc, cur){
          return acc + cur.Violations.length;
        }, 0);
      }

      var restaurantViolationScore = r.Ms4.RestaurantInspectionAndViolations && r.Ms4.RestaurantInspectionAndViolations.RestaurantInspections && r.Ms4.RestaurantInspectionAndViolations.RestaurantInspections.length
            && r.Ms4.RestaurantInspectionAndViolations.RestaurantInspections[0].RestaurantViolations && r.Ms4.RestaurantInspectionAndViolations.RestaurantInspections[0].RestaurantViolations.length
            && r.Ms4.RestaurantInspectionAndViolations.RestaurantInspections[0].RestaurantViolations[0].Score

      return {
        businessFirm: {
          sic: r.Ms1.BusinessSicCodes && r.Ms1.BusinessSicCodes.length && `${r.Ms1.BusinessSicCodes[0].Code} - ${r.Ms1.BusinessSicCodes[0].Description}`.toLowerCase(),
          naics: r.Ms1.BusinessNaicsCodes && r.Ms1.BusinessNaicsCodes.length && `${r.Ms1.BusinessNaicsCodes[0].Code} - ${r.Ms1.BusinessNaicsCodes[0].Description}`.toLowerCase(),
          sales: r.Ms1.SalesVolume,
          numberOfEmployees: r.Ms1.TotalEmployees,
          yearStarted: r.Ms2.YearStarted,
          creditScore: r.Ms1.CreditScore,
          relativeCreditGrading: relativeCreditGrading && relativeCreditGrading.GradingValue,
          restaurantViolationScore: restaurantViolationScore,
          liquorlicensestatus: r.Ms2.LiquorLicenseStatus,
          hoursOfOperation: r.Ms2.HoursOfOperation,
          osha: {
            inspectionsInLast10Years: r.Ms4.OshaInpectionsAndViolations.OshaResults.length,
            violationsInLast10Years: totalOshaViolations,
            results: r.Ms4.OshaInpectionsAndViolations.OshaResults
          }
        },
        propertyInfo: {
          constructionClass: r.Ms1.BuildingFireConstructionCode && `${r.Ms1.BuildingFireConstructionCode.Code} - ${r.Ms1.BuildingFireConstructionCode.Description}`.toLowerCase(),
          numberofStories: r.Ms1.Stories,
          yearBuilt: r.Ms1.YearBuilt,
          squareFootage: r.Ms1.SquareFootage,
          sprinklered: (r.Ms3.Sprinklered || "").toString(),
          occupancy: r.Ms1.Occupancy && r.Ms1.Occupancy.Description
        },
        neighborhoodInfo: {
          ppc: r.Ms1.Ppc,
          bcegs: r.Ms3.Bcegs,
          crimeScore: r.Ms3 && r.Ms3.Crime.CAPRiskIndex && r.Ms3.Crime.CAPRiskIndex.IndexValuesUpto10 && r.Ms3.Crime.CAPRiskIndex.IndexValuesUpto10.Current,
        }
      };
  };

  var latency = function(promise, delay){
    var min = 1000, max = 1000;
    var deferred = $q.defer();
    delay = delay || Math.floor(Math.random() * (max - min + 1)) + min;

    setTimeout(function() {
      deferred.resolve(promise);
    }, delay);
    return deferred.promise;
  };

  factory.states = states;

  factory.findBusiness = function(text){
    return latency(businesses).then(function(res){
      return res.map(function(i){
        return Object.assign({}, i);
      });
    });
  };

  factory.findAddress = function(text){
    return businesses.then(function(res){
          if(!res || !res.length) return [];
          var result = res.filter(function(i){
            return i.formatted_address.includes(text);
          });

          // cloning object to prevent tampering with orginal object.
          return result.map(function(i){
            return Object.assign({}, i);
          });
    });
  };

  factory.getQuote = function(business) {
    business = business || { "id":"I718894407","name":"goldman sachs & co","formatted_name":"GOLDMAN SACHS & CO","address_components":{"StreetAddress1":"545  WASHINGTON BLVD","City":"JERSEY CITY","PostalCity":null,"State":"NJ","Zip":"07310","Zip4":null,"County":null},"formatted_address":"545 washington blvd jersey city nj 07310"};
    return latency($http.get(path + 'data/elephant-bar-restaurant.json'), 1000).then(function(report) {
        return calculateQuote.then(function(quote){
          return Object.assign({ business: business, policy: quote }, transformReport(report.data));
        });
    });


  };

  return factory;
});




// Define the `bopController` controller on the `phonecatApp` module
app.controller('ctrl', function($scope, $uibModal, datasource, $q, path) {
    var template = {
      quote: `${path}quote.html`,
      footer: `${path}footer.html`,
      nav: `${path}nav.html`
    };

    var viewQuote = function(source){
       $scope.calculateQuote = !Boolean($.trim($scope.business));
       $scope.generateingQuote = source.then(function(res){
          $scope.quote = res;
          setTimeout(function(){
            var navHeight = $('.navbar').innerHeight();
            $("html, body").animate({ scrollTop: $(".content").offset().top - navHeight}, 'slow', function(){
              $("body").addClass('reveal-quote').animate({ scrollTop: 0}, 'fast', function(){
                  $scope.quote = res;
              });
            });
          });
       });
    };

    var clear = function(){
      $scope.listOfBusinesses = null;
      $scope.selectedBusiness = null;
      $scope.quote = null;
    };

    var formattedAddress = function(){
      return (`${ $scope.street || ""} ${ $scope.city || ""} ${$scope.state || ""} ${$scope.zip || ""}` || "").trim().replace(/\s\s+/g, ' ');
    };

    datasource.states.then(function(res){
      var selected = res.find(function(i){return i.abbreviation.includes("IA");});
      $scope.listOfStates = res;
      $scope.state = selected.abbreviation;
    });

    $scope.selectBusiness = function(business){
      var previousSelectedItem =  $scope.listOfBusinesses.find(function(i){
        return i.selected;
      });

      if(previousSelectedItem){
        previousSelectedItem.selected = false;
      }
      business.selected = true;
      $scope.selectedBusiness = business;
    };


  $scope.getQuote = function(){
    viewQuote(datasource.getQuote({
      name: $scope.selectedBusiness? $scope.selectedBusiness.name: $scope.business.toLowerCase(),
      formatted_name: $scope.business,
      formatted_address: formattedAddress()
    }));
  };

  $scope.search = function() {
     text = ($scope.business || "").toLowerCase();
     clear();

    if(!$scope.business && $.trim(formattedAddress())){
      $scope.findingProperty = true;
      $scope.searching = datasource.findBusiness(text).then(function(res){
        $scope.findingProperty = false;
        $scope.listOfBusinesses = res;
     });
    }

    else {
      $scope.getQuote();
    }
 };


   //$scope.business = "Elephant Bar & Grill";
   $scope.clear = clear;
   $scope.street = "200 SW 2nd St";
   $scope.city = "Des Moines";
   $scope.zip = "50309";
   $scope.findingProperty = false;
   $scope.listOfBusinesses = $scope.quote = null;
   $scope.selectedBusiness = null;
   $scope.rootUrl = path;
   $scope.template = template;
   $scope.calculateQuote = false;



   //viewQuote(datasource.getQuote());
   /*$scope.searching = datasource.findBusiness().then(function(res){
     $scope.listOfBusinesses = res;
   });
   //*/


});
