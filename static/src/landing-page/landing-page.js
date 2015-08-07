angular.module('landingPage', [
    'ngRoute',
    'profileService'
  ])



  .config(function($routeProvider) {
    $routeProvider.when('/', {
      templateUrl: 'landing-page/landing.tpl.html',
      controller: 'landingPageCtrl'
    })
  })


  .controller("landingPageCtrl", function($scope,
                                          $http,
                                          $auth, // from satellizer
                                          ProfileService){

    console.log("loaded the landing page controller")

    $scope.authenticate = function() {
      $auth.authenticate("github").then(function(resp){
        alert("authenticated, i think?")
      })
    };

    $scope.newProfile = {}
    $scope.newProfile.coreJournals = [{}]

    $scope.makeProfile = function(){
      ProfileService.createProfile(
        $scope.newProfile.name,
        $scope.newProfile.pmids.split("\n"),
        _.pluck($scope.newProfile.coreJournals, "name")
      )
    }

    $scope.addCoreJournal = function(){
      console.log("adding a core journal field")
      $scope.newProfile.coreJournals.push({})
    }


    $scope.getJournalNames = function(nameStartsWith){
      return $http.get("api/journals/" + nameStartsWith)
      .then(function(resp){
          return resp.data
      })
    }

  })


