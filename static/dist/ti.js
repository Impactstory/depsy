/* yay impactstory */
angular.module('app', [
  // external libs
  'ngRoute',
  'ngResource',
  'ui.bootstrap',
  'ngProgress',
  'ngSanitize',

  'templates.app',  // this is how it accesses the cached templates in ti.js

  'staticPages',
  'personPage',
  'tagPage',
  'packagePage',
  'header',
  'footer',
  'snippet',

  'directives.wheel',
  'resourcesModule',
  'pageService',
  'formatterService',

  'top'

]);




angular.module('app').config(function ($routeProvider,
                                       $locationProvider) {
  $locationProvider.html5Mode(true);


//  paginationTemplateProvider.setPath('directives/pagination.tpl.html')
});


angular.module('app').run(function($route,
                                   $rootScope,
                                   $timeout,
                                   ngProgress,
                                   $location) {



  $rootScope.$on('$routeChangeStart', function(next, current){
    console.log("route change start")
    ngProgress.start()
  })
  $rootScope.$on('$routeChangeSuccess', function(next, current){
    console.log("route change success")
    window.scrollTo(0, 0)
//    ngProgress.complete()
  })
  $rootScope.$on('$routeChangeError', function(event, current, previous, rejection){
    console.log("$routeChangeError")
    window.scrollTo(0, 0)
    ngProgress.complete()
  });


  // from http://cwestblog.com/2012/09/28/javascript-number-getordinalfor/
  (function(o) {
    Number.getOrdinalFor = function(intNum, includeNumber) {
      return (includeNumber ? intNum : "")
        + (o[((intNum = Math.abs(intNum % 100)) - 20) % 10] || o[intNum] || "th");
    };
  })([,"st","nd","rd"]);



  /*
  this lets you change the args of the URL without reloading the whole view. from
     - https://github.com/angular/angular.js/issues/1699#issuecomment-59283973
     - http://joelsaupe.com/programming/angularjs-change-path-without-reloading/
     - https://github.com/angular/angular.js/issues/1699#issuecomment-60532290
  */
  var original = $location.path;
  $location.path = function (path, reload) {
      if (reload === false) {
          var lastRoute = $route.current;
          var un = $rootScope.$on('$locationChangeSuccess', function () {
              $route.current = lastRoute;
              un();
          });
        $timeout(un, 500)
      }
      return original.apply($location, [path]);
  };




});


angular.module('app').controller('AppCtrl', function(
  $rootScope,
  $scope,
  $location,
  $sce,
  FormatterService,
  PageService){



  $scope.page = PageService




  function toRoundedSciNotation(n){

  }

  // from http://cwestblog.com/2012/09/28/javascript-number-getordinalfor/
  $scope.getOrdinal = function(n) {
    var s=["th","st","nd","rd"],
      v=n%100;
    return n+(s[(v-20)%10]||s[v]||s[0]);
  }

  $scope.toPercentile = function(proportion){
    return $scope.getOrdinal(Math.floor(proportion * 100))
  }

  $scope.floor = function(num){
    return Math.floor(num)
  }

  $scope.round = function(num, places){
    if (!places){
      places = 0
    }

    if (!num){
      num = 0
    }

    var ret = num.toFixed(places)

    // super hack
    if (ret == "100.0") {
      ret = "99.9"
    }
    else if (ret == "100") {
      ret = "99"
    }
    return ret


    var multiplier = Math.pow(10, places)
    var rounded = Math.round(num * multiplier)  / multiplier
    if (rounded == 100) {
      console.log("rounded", rounded)
      rounded = 99.9999999
    }
    return rounded.toFixed(places)
  }


  $scope.trustHtml = function(str){
    console.log("trusting html:", str)
    return $sce.trustAsHtml(str)
  }



  /*
  $scope.$on('$routeChangeError', function(event, current, previous, rejection){
    RouteChangeErrorHandler.handle(event, current, previous, rejection)
  });
  */


  $scope.$on('$locationChangeStart', function(event, next, current){
  })


});


angular.module("directives.badge", [])
    .directive("badge", function($modal, $http){

        return {
            templateUrl: "directives/badge.tpl.html",
            restrict: "EA",
            link: function(scope, elem, attrs) {

                var badgeUrl = "api/" + attrs.entity + "/badge.svg"

                scope.openBadgeModal = function(){
                    var modalInstance = $modal.open({
                        controller: "badgeModalCtrl",
                        templateUrl: 'badge-modal.tpl.html',
                        resolve: {
                            //badgeMarkup: function () {
                            //    console.log("making badgeMarkup call to ", badgeUrl)
                            //    return $http.get(badgeUrl)
                            //},
                            badgeUrl: function(){
                                return badgeUrl
                            }
                        }
                    })
                }
            }
        }


    })

    .controller("badgeModalCtrl", function($scope, $sce, $location, badgeUrl){
        $scope.badgeUrl = badgeUrl
        $scope.currentUrl = $location.absUrl()


    })
















angular.module("directives.languageIcon", [])
.directive("languageIcon", function(){


  var hueFromString = function(str) {
      var hash = 0;
      if (str.length == 0) return hash;
      for (var i = 0; i < str.length; i++) {
          hash = str.charCodeAt(i) + ((hash << 5) - hash);
          hash = hash & hash; // Convert to 32bit integer
      }
      return hash % 360;
  };

    return {
      templateUrl: "directives/language-icon.tpl.html",
      restrict: "EA",
      link: function(scope, elem, attrs) {

        scope.languageName = attrs.language
        scope.languageHue = hueFromString(attrs.language)
      }
    }


  })
















angular.module("directives.wheel", [])
    .directive("wheel", function(){

        function getWheelVal(credit){
            if (credit <= (1/16)) {
                return "tiny"
            }

            else if (credit >= (15/16) && credit < 1) {
                return "nearly-all"
            }

            else {
                return Math.round(credit * 8)
            }


        }



        return {
            templateUrl: "directives/wheel.tpl.html",
            restrict: "EA",
            link: function(scope, elem, attrs) {

                // we're in a list of authors on the package page
                if (scope.person_package){
                    var personPackage = scope.person_package
                    personPackage.num_authors = scope.package.num_authors
                    personPackage.num_committers = scope.package.num_committers
                    personPackage.num_commits = scope.package.num_commits
                    scope.personName = scope.person_package.name
                }

                // we're in a list of packages on the person page
                else if (scope.package){
                    var personPackage = scope.package
                    scope.personName = scope.person.name

                }


                // handle the popover position
                if (attrs.popoverRight){
                    scope.popoverRight = true
                }
                else {
                    scope.popoverRight = false
                }

                // computet the credit percentage number
                scope.percentCredit = Math.min(
                    100,
                    Math.ceil(personPackage.person_package_credit * 100)
                )

                // figure what wheel image to use
                scope.wheelVal = getWheelVal(personPackage.person_package_credit)
                scope.wheelData = personPackage

                // handy vars for the markup to use
                if (personPackage.roles.github_contributor == personPackage.num_commits) {
                    scope.wheelData.soleCommitter = true
                }



            }
        }


    })
















angular.module("filterService", [])

.factory("FilterService", function($location){

    var filters = {
      only_academic: "true",
      language: "python",
      tag: null,
      type: "pacakges"
    }

    var setFromUrl = function(){
      filters.only_academic = $location.search().only_academic
      filters.tag = $location.search().tag
      filters.language = $location.search().language
      filters.type = $location.search().type
      if (!filters.language){
        set("language", "python")
      }
      if (!filters.type){
        set("type", "people")
      }
      console.log("set filters from url", filters)
    }

    var set = function(k, v){
      filters[k] = v
      $location.search(k, v)
    }
    var toggle = function(k){
      // for booleans
      if (filters[k]) {
        filters[k] = null
      }
      else {
        filters[k] = "true"  // must be string or won't show up in url
      }
      $location.search(k, filters[k])
    }

    var unset = function(k){
      filters[k] = null
    }
    var unsetAll = function(){
        console.log("unset all!")
        _.each(filters, function(v, k){
            filters[k] = null
            $location.search(k, null)
        })
    }

    var asQueryStr = function(){
      var ret = []
      _.each(filters, function(v, k){
        if (v){
          ret.push(k + "=" + v)
        }
      })
      return ret.join("&")
    }


  return {
    d: filters,
    set: set,
    toggle: toggle,
    unset: unset,
    setFromUrl: setFromUrl,
    asQueryStr: asQueryStr,
    unsetAll: unsetAll
  }
});
angular.module('footer', [
])



    .controller("footerCtrl", function($scope,
                                       $location,
                                       $rootScope,
                                       FormatterService,
                                       FilterService,
                                       $http){


        //$scope.hideEmailSignup = !!$.cookie("hideEmailSignup")
        //
        //
        //$scope.dismissEmailSignup = function(){
        //    console.log("dismiss the signup")
        //    $scope.hideEmailSignup = true
        //    !$.cookie("hideEmailSignup", true)
        //}



    })







angular.module("formatterService", [])

    .factory("FormatterService", function($location){

        var commas = function(x) { // from stackoverflow
            if (!x) {
                return x
            }
            var parts = x.toString().split(".");
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return parts.join(".");
        }

        var short = function(num, fixedAt){
            if (typeof num === "string"){
                return num  // not really a number
            }

            // hack for dealing with pagerank
            if (fixedAt){
                return num.toFixed(fixedAt)
            }


            // from http://stackoverflow.com/a/14994860/226013
            if (num === null){
                return 0
            }
            if (num === 0){
                return 0
            }

            if (num >= 1000000) {
                return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
            }
            if (num >= 100000) { // no decimal if greater than 100thou
                return (num / 1000).toFixed(0).replace(/\.0$/, '') + 'k';
            }

            if (num >= 1000) {
                return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
            }


            if (num < 1) {
                return Math.round(num * 100) / 100
            }

            return Math.floor(num);
        }

        var round = function(num){
            return Math.round(num)
        }

        var doubleUrlEncode = function(str){
            return encodeURIComponent( encodeURIComponent(str) )
        }

        // from http://cwestblog.com/2012/09/28/javascript-number-getordinalfor/
        var ordinal = function(n) {
            n = Math.round(n)
            var s=["th","st","nd","rd"],
                v=n%100;
            return n+(s[(v-20)%10]||s[v]||s[0]);
        }

        return {
            short: short,
            commas: commas,
            round: round,
            ordinal: ordinal,
            doubleUrlEncode: doubleUrlEncode

        }
    });
angular.module('header', [
  ])



  .controller("headerCtrl", function($scope,
                                     $location,
                                     $rootScope,
                                     FormatterService,
                                     FilterService,
                                     $http){



    $scope.searchResultSelected = ''
    $scope.format = FormatterService
    $scope.foo = 42

    $rootScope.$on('$routeChangeSuccess', function(next, current){
      $scope.searchResultSelected = ''
      document.getElementById("search-box").blur()
    })
    $rootScope.$on('$routeChangeError', function(event, current, previous, rejection){
      $scope.searchResultSelected = ''
      document.getElementById("search-box").blur()
    });


    $scope.onSelect = function(item ){
      console.log("select!", item)
      if (item.type=='pypi_project') {
        $location.path("package/python/" + item.name)
      }
      else if (item.type=='cran_project') {
        $location.path("package/r/" + item.name)
      }
      else if (item.type=='person') {
        $location.path("person/" + item.id)
      }
      else if (item.type=='tag') {
        FilterService.unsetAll()
        $location.path("tag/" + encodeURIComponent(encodeURIComponent( item.name)))
      }
    }

    $scope.doSearch = function(val){
      console.log("doing search")
      return $http.get("/api/search/" + val)
        .then(
          function(resp){
            //return resp.data.list
            return _.map(resp.data.list, function(match){
              //return match
              match.urlName = encodeURIComponent(encodeURIComponent(match.name))
              return match
            })

            var names = _.pluck(resp.data.list, "name")
            console.log(names)
            return names
          }
        )
    }

  })

.controller("searchResultCtrl", function($scope, $sce){


    $scope.trustHtml = function(str){
      console.log("trustHtml got a thing", str)

      return $sce.trustAsHtml(str)
    }




  })







angular.module('packagePage', [
    'directives.badge',
    'ngRoute'
])



    .config(function($routeProvider) {
        $routeProvider.when('/package/:language/:package_name', {
            templateUrl: 'package-page/package-page.tpl.html',
            controller: 'PackagePageCtrl',
            resolve: {
                packageResp: function($http, $route, PackageResource){
                    return PackageResource.get({
                        namespace: $route.current.params.language,
                        name: $route.current.params.package_name
                    }).$promise
                }
            }
        })
    })



    .controller("PackagePageCtrl", function($scope,
                                            $routeParams,
                                            ngProgress,
                                            FormatterService,
                                            packageResp){
        ngProgress.complete()
        $scope.package = packageResp
        $scope.format = FormatterService
        $scope.depNode = packageResp.rev_deps_tree

        console.log("package page!", $scope.package)

        $scope.apiOnly = function(){
            alert("Sorry, we're still working on this! In the meantime, you can view the raw data via our API.")
        }










    })




angular.module('personPage', [
    'ngRoute',
    'profileService',
    'directives.badge',
    "directives.languageIcon"
  ])



  .config(function($routeProvider) {
    $routeProvider.when('/person/:person_id', {
      templateUrl: 'person-page/person-page.tpl.html',
      controller: 'personPageCtrl',
      resolve: {
        personResp: function($http, $route){
          var url = "/api/person/" + $route.current.params.person_id
          return $http.get(url)
        }
      }
    })
  })



  .controller("personPageCtrl", function($scope,
                                          $routeParams,
                                          ngProgress,
                                          FormatterService,
                                          personResp){
    ngProgress.complete()
    $scope.format = FormatterService
    $scope.person = personResp.data
    console.log("retrieved the person", $scope.person)






  })




angular.module('resourcesModule', [])
  .factory('Leaders', function($resource) {
    return $resource('api/leaderboard')
  })


  .factory('PackageResource', function($resource) {
    return $resource('/api/package/:namespace/:name')
  })
angular.module('articleService', [
  ])



  .factory("ArticleService", function($http,
                                      $timeout,
                                      $location){

    var data = {}

    function getArticle(pmid){
      var url = "api/article/" + pmid
      console.log("getting article", pmid)
      return $http.get(url).success(function(resp){
        console.log("got response for api/article/" + pmid, resp)
        data.article = resp
      })
    }

    return {
      data: data,
      getArticle: getArticle
    }


  })
angular.module('currentUserService', [
    'resourcesModule'
  ])



  .factory("CurrentUser", function(UserResource){

    var data = {}

    function overWriteData(newData){
      _.each(newData, function(v, k){
        data[k] = v
      })
    }

    return {
      d: data,
      get: function(){
        return UserResource.get(
          function(newData){
            overWriteData(newData)
            console.log("overwrote the CurrentUser data. now it's this:", data)
          },
          function(resp){
            console.log("error getting current user data", resp)
          }
        )
      }
    }


  })
angular.module('pageService', [
  ])



  .factory("PageService", function(){

    var data = {}
    var defaultData = {}

    function reset(){
      console.log("resetting the page service data")
      _.each(defaultData, function(v, k){
        data[k] = v
      })
    }

    return {
      d: data,
      reset: reset
    }


  })
angular.module('profileService', [
  ])



  .factory("ProfileService", function($http,
                                      $timeout,
                                      $location){

    var data = {
      profile: {
        articles:[]
      }
    }

    function profileStillLoading(){
      console.log("testing if profile still loading", data.profile.articles)
      return _.any(data.profile.articles, function(article){
        return _.isNull(article.percentile)
      })
    }

    function getProfile(slug){
      var url = "/profile/" + slug
      console.log("getting profile for", slug)
      return $http.get(url).success(function(resp){
        data.profile = resp

        if (profileStillLoading()){
          $timeout(function(){
            getProfile(slug)
          }, 1000)
        }

      })
    }

    return {
      data: data,
      foo: function(){
        return "i am in the profile service"
      },

      createProfile: function(name, pmids, coreJournals) {
        console.log("i am making a profile:", name, pmids)
        var postData = {
          name: name,
          pmids: pmids,
          core_journals: coreJournals
        }
        $http.post("/profile",postData)
          .success(function(resp, status, headers){
            console.log("yay got a resp from /profile!", resp)
            $location.path("/u/" + resp.slug)
          })
      },

      getProfile: getProfile
    }


  })
angular.module('snippet', [
  ])



  .controller("packageSnippetCtrl", function($scope){

      //if ($scope.dep) {
      //  $scope.snippetPackage = $scope.dep
      //}
      //
      //else if ($scope.package) {
      //  //$scope.snippetPackage = $scope.package
      //}


//    var subscoreNames = [
//      "num_downloads",
//      "pagerank",
//      "num_citations"
//    ]
//    var subscores = _.map(subscoreNames, function(name){
//      return {
//        name: name,
//        percentile: $scope.package[name + "_percentile"],
//        val: $scope.package[name]
//      }
//    })

//    var subScoresSum =  _.reduce(
//      _.map(subScores, function(x){return x[1]}),
//      function(memo, num){ return memo + num; },
//      0
//    )
//    $scope.subScores = subscores
  })


  .controller("personSnippetCtrl", function($scope){

  })


angular.module('staticPages', [
    'ngRoute'
  ])



  .config(function($routeProvider) {
    $routeProvider.when('/', {
      redirectTo: "/leaderboard"
    })
  })


  .config(function($routeProvider) {
    $routeProvider.when('/about', {
      templateUrl: "static-pages/about.tpl.html",
      controller: "StaticPageCtrl"
    })
  })

  .controller("StaticPageCtrl", function($scope, $sce, $http, ngProgress){

      console.log("getting readme...")
      $http.get("/api/readme").then(
          function(resp){
            console.log("readme:", resp.data.readme)
            $scope.readme = $sce.trustAsHtml(resp.data.readme)
            ngProgress.complete()
          },
          function(resp){
            alert("Sorry, there was an error getting this page!")
            ngProgress.complete()
          }

      )

  })











angular.module('tagPage', [
    'ngRoute',
    'profileService',
    "directives.languageIcon"
  ])



  .config(function($routeProvider) {
    $routeProvider.when('/tag/:tagName', {
      templateUrl: 'tag-page/tag-page.tpl.html',
      controller: 'tagPageCtrl',
      resolve: {
        productsResp: function($http, $route){
          var url = "/api/leaderboard?type=packages&tag=" + $route.current.params.tagName
          return $http.get(url)
        }
      }
    })
  })



  .controller("tagPageCtrl", function($scope,
                                          $routeParams,
                                          ngProgress,
                                          FormatterService,
                                          productsResp){
    ngProgress.complete()
    $scope.format = FormatterService

    $scope.packages = productsResp.data
    console.log("retrieved the tag", productsResp)






  })




angular.module('top', [
    'ngRoute',
    'filterService'
  ])



  .config(function($routeProvider) {
    $routeProvider.when('/leaderboard', {
      templateUrl: 'top/top.tpl.html',
      controller: 'TopController',
      resolve: {

      }
    })
  })


  .controller("TopController", function($scope,
                                          $http,
                                          $rootScope,
                                          $routeParams,
                                          Leaders,
                                          ngProgress,
                                          FormatterService,
                                          FilterService){
    FilterService.setFromUrl()
    $scope.filters = FilterService
    $scope.format = FormatterService

    getLeaders()

    var makeUrl = function(){
      return "leaderboard?" + FilterService.asQueryStr()
    }

    function getLeaders(){
      console.log("getLeaders() go", FilterService.d)


      Leaders.get(
        FilterService.d,
        function(resp){
          console.log("got a resp from leaders call", resp.list)
          $scope.leaders = resp
          ngProgress.complete()
        },
        function(resp){
          console.log("got an error :(")
          ngProgress.complete()
        }
      )

    }



















  })

angular.module('templates.app', ['directives/badge.tpl.html', 'directives/language-icon.tpl.html', 'directives/wheel-popover.tpl.html', 'directives/wheel.tpl.html', 'footer/footer.tpl.html', 'header/header.tpl.html', 'header/search-result.tpl.html', 'package-page/package-page.tpl.html', 'person-page/person-page.tpl.html', 'snippet/package-impact-popover.tpl.html', 'snippet/package-snippet.tpl.html', 'snippet/person-impact-popover.tpl.html', 'snippet/person-mini.tpl.html', 'snippet/person-snippet.tpl.html', 'snippet/tag-snippet.tpl.html', 'static-pages/about.tpl.html', 'static-pages/landing.tpl.html', 'tag-page/tag-page.tpl.html', 'top/top.tpl.html']);

angular.module("directives/badge.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("directives/badge.tpl.html",
    "<script type=\"text/ng-template\" id=\"badge-modal.tpl.html\">\n" +
    "    <div class=\"modal-body badge-modal\">\n" +
    "        <div class=\"badge-section\">\n" +
    "            <a href=\"{{ currentUrl }}\">\n" +
    "                <img class=\"badge-markup-container\" src=\"{{ badgeUrl }}\">\n" +
    "            </a>\n" +
    "        </div>\n" +
    "        <div class=\"paste-this markdown\">\n" +
    "            <h3>\n" +
    "                <span class=\"main\">Markdown</span>\n" +
    "                <span class=\"sub\">for GitHub README.md</span>\n" +
    "            </h3>\n" +
    "            <pre>[![Research software impact](http://depsy.org/{{ badgeUrl }})]({{ currentUrl }})</pre>\n" +
    "        </div>\n" +
    "        <div class=\"paste-this html\">\n" +
    "            <h3>\n" +
    "                <span class=\"main\">HTML</span>\n" +
    "                <span class=\"sub\">for blogs and whatnot</span>\n" +
    "            </h3>\n" +
    "            <pre>&#x3C;a href=&#x22;{{ currentUrl }}&#x22;&#x3E;\n" +
    "    &#x3C;img src=&#x22;http://depsy.org/{{ badgeUrl }}&#x22;&#x3E;\n" +
    "&#x3C;/a&#x3E;</pre>\n" +
    "        </div>\n" +
    "\n" +
    "    </div>\n" +
    "    <div class=\"modal-footer\">\n" +
    "        <button class=\"btn btn-primary\" type=\"button\" ng-click=\"$close()\">OK</button>\n" +
    "    </div>\n" +
    "</script>\n" +
    "\n" +
    "<a class=\"embed-badge-link btn btn-default\" ng-click=\"openBadgeModal()\">\n" +
    "    <i class=\"fa fa-trophy\"></i>\n" +
    "    Get badge\n" +
    "</a>");
}]);

angular.module("directives/language-icon.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("directives/language-icon.tpl.html",
    "<span class=\"language\"\n" +
    "      ng-class=\"{badge: languageName}\"\n" +
    "      style=\"background-color: hsl({{ languageHue }}, 80%, 30%)\">\n" +
    "   {{ languageName }}\n" +
    "</span>");
}]);

angular.module("directives/wheel-popover.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("directives/wheel-popover.tpl.html",
    "<div class=\"wheel-popover\">\n" +
    "    <div class=\"wheel-popover-header\">\n" +
    "        <h4>\n" +
    "            <span class=\"val\">{{ percentCredit }}<span class=\"percent-sign\">%</span></span>\n" +
    "            <span class=\"ti-label\">authorship credit</span>\n" +
    "        </h4>\n" +
    "    </div>\n" +
    "\n" +
    "    <!--\n" +
    "    <span class=\"name\">{{ personName }}</span>\n" +
    "    -->\n" +
    "\n" +
    "\n" +
    "    <div class=\"body\">\n" +
    "        <span class=\"owner-only\" ng-show=\"wheelData.roles.owner_only\">\n" +
    "            Owns this project’s GitHub repository.\n" +
    "        </span>\n" +
    "\n" +
    "        <span class=\"sole-author\" ng-show=\"wheelData.roles.author && wheelData.num_authors==1\">\n" +
    "            Sole listed author<span class=\"there-are-committers\" ng-show=\"wheelData.num_committers\">,\n" +
    "                <span class=\"is-also-committer\" ng-show=\"wheelData.roles.github_contributor\">\n" +
    "                    and\n" +
    "                    <span class=\"contrib-and\">\n" +
    "                        contributed\n" +
    "                        <span class=\"num-commits\" ng-show=\"wheelData.soleCommitter\">all</span>\n" +
    "                        <span class=\"num-commits\" ng-show=\"!wheelData.soleCommitter\">{{ format.commas(wheelData.roles.github_contributor) }} </span>\n" +
    "                        of this project's\n" +
    "                        {{ format.commas(wheelData.num_commits) }}\n" +
    "                        GitHub commits\n" +
    "                    </span>\n" +
    "\n" +
    "                </span>\n" +
    "                <span class=\"is-not-also-committer\" ng-show=\"!wheelData.roles.github_contributor\">\n" +
    "                    but\n" +
    "                    <span class=\"contrib-and\">\n" +
    "                        shares credit with this project's {{ format.commas(wheelData.num_committers) }}\n" +
    "                        GitHub committers\n" +
    "                    </span>\n" +
    "                </span>\n" +
    "            </span>\n" +
    "        </span>\n" +
    "\n" +
    "        <span class=\"coauthor\" ng-show=\"wheelData.roles.author && wheelData.num_authors > 1\">\n" +
    "             One of {{ wheelData.num_authors }} listed coauthors<span class=\"there-are-committers\" ng-show=\"wheelData.num_committers\">,\n" +
    "                <span class=\"is-also-committer\" ng-show=\"wheelData.roles.github_contributor\">\n" +
    "                    and\n" +
    "                    <span class=\"contrib-and\">\n" +
    "                        contributed\n" +
    "                        <span class=\"num-commits\" ng-show=\"wheelData.soleCommitter\">all</span>\n" +
    "                        <span class=\"num-commits\" ng-show=\"!wheelData.soleCommitter\">{{ format.commas(wheelData.roles.github_contributor) }} </span>\n" +
    "                        of this project's\n" +
    "                        {{ format.commas(wheelData.num_commits) }}\n" +
    "                        GitHub commits\n" +
    "                    </span>\n" +
    "                </span>\n" +
    "                <span class=\"is-not-also-committer\" ng-show=\"!wheelData.roles.github_contributor\">\n" +
    "                    and also\n" +
    "                    <span class=\"contrib-and\">\n" +
    "                        shares credit with this project's {{ format.commas(wheelData.num_committers) }}\n" +
    "                        GitHub committers\n" +
    "                    </span>\n" +
    "                </span>\n" +
    "            </span>\n" +
    "        </span>\n" +
    "\n" +
    "\n" +
    "        <span class=\"committer-not-author\" ng-show=\"wheelData.roles.github_contributor && !wheelData.roles.author\">\n" +
    "            Contributed {{ format.commas(wheelData.roles.github_contributor) }} of this project's\n" +
    "            {{ format.commas(wheelData.num_commits) }}\n" +
    "            GitHub commits\n" +
    "        </span>\n" +
    "    </div>\n" +
    "\n" +
    "\n" +
    "</div>");
}]);

angular.module("directives/wheel.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("directives/wheel.tpl.html",
    "<img class='wheel popover-right'\n" +
    "     ng-show=\"popoverRight\"\n" +
    "     popover-template=\"'directives/wheel-popover.tpl.html'\"\n" +
    "     popover-placement=\"right\"\n" +
    "     popover-trigger=\"mouseenter\"\n" +
    "     ng-src='static/img/wheel/{{ wheelVal }}.png' />\n" +
    "\n" +
    "<img class='wheel popover-left'\n" +
    "     ng-show=\"!popoverRight\"\n" +
    "     popover-template=\"'directives/wheel-popover.tpl.html'\"\n" +
    "     popover-placement=\"left\"\n" +
    "     popover-trigger=\"mouseenter\"\n" +
    "     ng-src='static/img/wheel/{{ wheelVal }}.png' />\n" +
    "");
}]);

angular.module("footer/footer.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("footer/footer.tpl.html",
    "<div id=\"footer\" ng-controller=\"footerCtrl\">\n" +
    "\n" +
    "\n" +
    "\n" +
    "    <div class=\"links\">\n" +
    "        <a href=\"/about\">\n" +
    "            <i class=\"fa fa-info-circle\"></i>\n" +
    "            About\n" +
    "        </a>\n" +
    "        <a href=\"https://github.com/Impactstory/depsy\">\n" +
    "            <i class=\"fa fa-github\"></i>\n" +
    "            Source code\n" +
    "        </a>\n" +
    "        <a href=\"https://twitter.com/depsy_org\">\n" +
    "            <i class=\"fa fa-twitter\"></i>\n" +
    "            Twitter\n" +
    "        </a>\n" +
    "    </div>\n" +
    "\n" +
    "\n" +
    "    <div id=\"mc_embed_signup\">\n" +
    "        <form action=\"//impactstory.us4.list-manage.com/subscribe/post?u=26fcc4e14b24319755845d9e0&amp;id=c9dd1339cd\" method=\"post\" id=\"mc-embedded-subscribe-form\" name=\"mc-embedded-subscribe-form\" class=\"validate\" target=\"_blank\" novalidate>\n" +
    "\n" +
    "            <div id=\"mc_embed_signup_scroll\" class=\"input-group\">\n" +
    "                <input class=\"form-control text-input\" type=\"email\" value=\"\" name=\"EMAIL\" class=\"email\" id=\"mce-EMAIL\" placeholder=\"Join the mailing list\" required>\n" +
    "           <span class=\"input-group-btn\">\n" +
    "              <input class=\"btn btn-default\" type=\"submit\" value=\"Go\" name=\"subscribe\" id=\"mc-embedded-subscribe\" class=\"button\">\n" +
    "           </span>\n" +
    "\n" +
    "                <!-- real people should not fill this in and expect good things - do not remove this or risk form bot signups-->\n" +
    "                <div style=\"position: absolute; left: -5000px;\"><input type=\"text\" name=\"b_26fcc4e14b24319755845d9e0_c9dd1339cd\" tabindex=\"-1\" value=\"\"></div>\n" +
    "            </div>\n" +
    "        </form>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"built-by\">\n" +
    "        Built with <i class=\"fa fa-heart\"></i> at <a href=\"http://impactstory.org/about\">Impactstory</a>,\n" +
    "        <br>\n" +
    "        with support from the National Science Foundation\n" +
    "    </div>\n" +
    "\n" +
    "</div>");
}]);

angular.module("header/header.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("header/header.tpl.html",
    "<div class=\"ti-header\" ng-controller=\"headerCtrl\">\n" +
    "   <h1>\n" +
    "      <a href=\"/\">\n" +
    "         <img src=\"static/img/logo-circle.png\" alt=\"\"/>\n" +
    "      </a>\n" +
    "   </h1>\n" +
    "\n" +
    "   <div class=\"ti-menu\">\n" +
    "      <a href=\"leaderboard?type=people\"\n" +
    "         popover=\"Top authors\"\n" +
    "         popover-trigger=\"mouseenter\"\n" +
    "         popover-placement=\"bottom\"\n" +
    "         class=\"menu-link\" id=\"leaders-menu-link\">\n" +
    "         <i class=\"fa fa-user\"></i>\n" +
    "      </a>\n" +
    "      <a href=\"leaderboard?type=packages\"\n" +
    "         popover=\"Top projects\"\n" +
    "         popover-trigger=\"mouseenter\"\n" +
    "         popover-placement=\"bottom\"\n" +
    "         class=\"menu-link\" id=\"leaders-menu-link\">\n" +
    "         <i class=\"fa fa-archive\"></i>\n" +
    "      </a>\n" +
    "      <a href=\"leaderboard?type=tags\"\n" +
    "         popover=\"Top topics\"\n" +
    "         popover-trigger=\"mouseenter\"\n" +
    "         popover-placement=\"bottom\"\n" +
    "         class=\"menu-link\" id=\"leaders-menu-link\">\n" +
    "         <i class=\"fa fa-tag\"></i>\n" +
    "      </a>\n" +
    "\n" +
    "      <!-- needs weird style hacks -->\n" +
    "      <a href=\"about\"\n" +
    "         class=\"menu-link about\" id=\"leaders-menu-link\">\n" +
    "         <i\n" +
    "         popover=\"Learn more about Depsy\"\n" +
    "         popover-trigger=\"mouseenter\"\n" +
    "         popover-placement=\"bottom\" class=\"fa fa-question-circle\"></i>\n" +
    "      </a>\n" +
    "\n" +
    "\n" +
    "   </div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "   <div class=\"search-box\">\n" +
    "    <input type=\"text\"\n" +
    "           id=\"search-box\"\n" +
    "           ng-model=\"searchResultSelected\"\n" +
    "           placeholder=\"Search packages, authors, and topics\"\n" +
    "           typeahead=\"result as result.name for result in doSearch($viewValue)\"\n" +
    "           typeahead-loading=\"loadingLocations\"\n" +
    "           typeahead-no-results=\"noResults\"\n" +
    "           typeahead-template-url=\"header/search-result.tpl.html\"\n" +
    "           typeahead-focus-first=\"false\"\n" +
    "           typeahead-on-select=\"onSelect($item)\"\n" +
    "           class=\"form-control input-lg\">\n" +
    "   </div>\n" +
    "\n" +
    "\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "");
}]);

angular.module("header/search-result.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("header/search-result.tpl.html",
    "\n" +
    "<div class=\"typeahead-group-header\" ng-if=\"match.model.is_first\">\n" +
    "   <span class=\"group-header-type pypy-package\" ng-if=\"match.model.type=='pypi_project'\">\n" +
    "      <img src=\"static/img/python.png\" alt=\"\"/>\n" +
    "      Python packages\n" +
    "   </span>\n" +
    "   <span class=\"group-header-type cran-package\" ng-if=\"match.model.type=='cran_project'\">\n" +
    "      <img src=\"static/img/r-logo.png\" alt=\"\"/>\n" +
    "      R packages\n" +
    "   </span>\n" +
    "   <span class=\"group-header-type people\" ng-if=\"match.model.type=='person'\">\n" +
    "      <i class=\"fa fa-user\"></i>\n" +
    "      People\n" +
    "   </span>\n" +
    "   <span class=\"group-header-type tags\" ng-if=\"match.model.type=='tag'\">\n" +
    "      <i class=\"fa fa-tag\"></i>\n" +
    "      Tags\n" +
    "   </span>\n" +
    "\n" +
    "</div>\n" +
    "<a ng-href=\"package/python/{{ match.model.name }}\" ng-if=\"match.model.type=='pypi_project'\">\n" +
    "   <span class=\"name\">\n" +
    "      {{ match.model.name }}\n" +
    "   </span>\n" +
    "   <span  class=\"summary\">\n" +
    "      {{ match.model.summary }}\n" +
    "   </span>\n" +
    "</a>\n" +
    "<a ng-href=\"package/r/{{ match.model.name }}\" ng-if=\"match.model.type=='cran_project'\">\n" +
    "   <span class=\"name\">\n" +
    "      {{ match.model.name }}\n" +
    "   </span>\n" +
    "   <span  class=\"summary\">\n" +
    "      {{ match.model.summary }}\n" +
    "   </span>\n" +
    "</a>\n" +
    "<a ng-href=\"person/{{ match.model.id }}\" ng-if=\"match.model.type=='person'\">\n" +
    "   <span class=\"name\">\n" +
    "      {{ match.model.name }}\n" +
    "   </span>\n" +
    "</a>\n" +
    "<a ng-href=\"tag/{{ match.model.urlName }}\" ng-if=\"match.model.type=='tag'\">\n" +
    "   <span class=\"name\">\n" +
    "      {{ match.model.name }}\n" +
    "   </span>\n" +
    "   <span class=\"tag summary\">\n" +
    "      {{ match.model.impact }} packages\n" +
    "   </span>\n" +
    "</a>\n" +
    "\n" +
    "\n" +
    "");
}]);

angular.module("package-page/package-page.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("package-page/package-page.tpl.html",
    "<div class=\"page entity-page package-page\">\n" +
    "\n" +
    "\n" +
    "    <div class=\"ti-page-sidebar\">\n" +
    "        <div class=\"sidebar-header\">\n" +
    "\n" +
    "            <div class=\"about\">\n" +
    "                <div class=\"meta\">\n" +
    "               <span class=\"name\">\n" +
    "                  {{ package.name }}\n" +
    "                   <i popover-title=\"Research software\"\n" +
    "                      popover-trigger=\"mouseenter\"\n" +
    "                      popover=\"We decide if something is research software based on language, as well as words in project tags, titles, and summaries.\"\n" +
    "                      ng-show=\"package.is_academic\"\n" +
    "                      class=\"is-academic fa fa-graduation-cap\"></i>\n" +
    "               </span>\n" +
    "\n" +
    "                    <div class=\"summary\">\n" +
    "                        {{ package.summary }}\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div class=\"links\">\n" +
    "                    <a class=\"language-icon r\"\n" +
    "                       href=\"https://cran.r-project.org/web/packages/{{ package.name }}/index.html\"\n" +
    "                       ng-if=\"package.language=='r'\">\n" +
    "                        R\n" +
    "                    </a>\n" +
    "                    <a class=\"language-icon python\"\n" +
    "                       href=\"https://pypi.python.org/pypi/{{ package.name }}\"\n" +
    "                       ng-if=\"package.language=='python'\">\n" +
    "                        py\n" +
    "                    </a>\n" +
    "                    <a class=\"github\"\n" +
    "                       ng-show=\"package.github_repo_name\"\n" +
    "                       href=\"http://github.com/{{ package.github_owner }}/{{ package.github_repo_name }}\">\n" +
    "                        <i class=\"fa fa-github\"></i>\n" +
    "                    </a>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "        <div class=\"sidebar-section tags\" ng-if=\"package.tags.length\">\n" +
    "            <h3>Tags</h3>\n" +
    "            <div class=\"tags\">\n" +
    "                <a class=\"tag\"\n" +
    "                   href=\"tag/{{ format.doubleUrlEncode(tag) }}\"\n" +
    "                   ng-repeat=\"tag in package.tags\">\n" +
    "                    {{ tag }}\n" +
    "                </a>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "        <div class=\"sidebar-section top-contribs\">\n" +
    "            <h3>{{ package.all_contribs.length }} contributors</h3>\n" +
    "            <div class=\"contrib\"\n" +
    "                 ng-repeat=\"person_package in package.top_contribs | orderBy: '-credit'\">\n" +
    "                <wheel popover-right=\"true\"></wheel>\n" +
    "\n" +
    "                  <div class=\"vis impact-stick\">\n" +
    "                      <div class=\"none\" ng-show=\"person_package.subscores.length == 0\">\n" +
    "                          none\n" +
    "                      </div>\n" +
    "                     <div class=\"bar-inner {{ subscore.name }}\"\n" +
    "                          style=\"width: {{ subscore.percentile * 33.33333 }}%;\"\n" +
    "                          ng-repeat=\"subscore in person_package.subscores\">\n" +
    "                     </div>\n" +
    "                  </div>\n" +
    "\n" +
    "                <!--\n" +
    "                <img class=\"person-icon\" src=\"{{ person_package.icon_small }}\" alt=\"\"/>\n" +
    "                -->\n" +
    "\n" +
    "                <a class=\"name\" href=\"person/{{ person_package.id }}\">{{ person_package.name }}</a>\n" +
    "            </div>\n" +
    "\n" +
    "            <span class=\"plus-more btn btn-default btn-xs\"\n" +
    "                  ng-show=\"package.all_contribs.length > package.top_contribs.length\"\n" +
    "                  ng-click=\"apiOnly()\">\n" +
    "                <i class=\"fa fa-plus\"></i>\n" +
    "                <span class=\"val\">{{ package.all_contribs.length - package.top_contribs.length }}</span> more\n" +
    "            </span>\n" +
    "\n" +
    "        </div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "        <div class=\"sidebar-section actions\">\n" +
    "            <a class=\"json-link btn btn-default\"\n" +
    "               target=\"_self\"\n" +
    "               href=\"api/package/{{ package.host }}/{{ package.name }}\">\n" +
    "                <i class=\"fa fa-cogs\"></i>\n" +
    "                View in API\n" +
    "            </a>\n" +
    "\n" +
    "            <badge entity=\"package/{{ package.host }}/{{ package.name }}\"></badge>\n" +
    "\n" +
    "\n" +
    "\n" +
    "            <!--\n" +
    "         <a href=\"https://twitter.com/share?url={{ encodeURIComponent('http://google.com') }}\" >Tweet</a>\n" +
    "         -->\n" +
    "\n" +
    "\n" +
    "        </div>\n" +
    "\n" +
    "\n" +
    "    </div>\n" +
    "\n" +
    "\n" +
    "    <div class=\"ti-page-body\">\n" +
    "\n" +
    "\n" +
    "        <div class=\"subscore package-page-subscore overall is-academic-{{ package.is_academic }}\">\n" +
    "            <div class=\"body research-package\">\n" +
    "                <div class=\"metrics\">\n" +
    "                    <span class=\"package-percentile\">\n" +
    "                        {{ format.round(package.impact_percentile * 100) }}\n" +
    "                    </span>\n" +
    "                    <span class=\"ti-label\">\n" +
    "                        percentile impact overall\n" +
    "                    </span>\n" +
    "                </div>\n" +
    "                <div class=\"explanation\">\n" +
    "                    Compared to all research software on\n" +
    "                    <span class=\"repo cran\" ng-show=\"package.host=='cran'\">CRAN</span>\n" +
    "                    <span class=\"repo PyPi\" ng-show=\"package.host=='pypi'\">PyPi</span>,\n" +
    "                    based on relative\n" +
    "                    <span class=\"num_downloads\">downloads,</span>\n" +
    "                    <span class=\"pagerank\">software reuse,</span> and\n" +
    "                    <span class=\"num_mentions\">citation.</span>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"body non-research-package\">\n" +
    "                <div class=\"heading\">\n" +
    "                    Not research software\n" +
    "                </div>\n" +
    "                <div class=\"explanation\">\n" +
    "                    Based on name, tags, and description, we're guessing this isn't\n" +
    "                    research software—so we haven't calculated impact percentile information. <br>\n" +
    "                    <a class=\"btn btn-default btn-xs\" href=\"http://twitter.com/depsy_org\">did we guess wrong?</a>\n" +
    "                </div>\n" +
    "\n" +
    "            </div>\n" +
    "\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"subscore package-page-subscore {{ subscore.name }}\"\n" +
    "             ng-repeat=\"subscore in package.subscores\">\n" +
    "            <h3>\n" +
    "                <i class=\"fa {{ subscore.icon }}\"></i>\n" +
    "                {{ subscore.display_name }}\n" +
    "            </h3>\n" +
    "            <div class=\"body\">\n" +
    "                <div class=\"metrics\">\n" +
    "                    <div class=\"impact-stick vis\" ng-show=\"package.is_academic\">\n" +
    "                        <div class=\"bar-inner {{ subscore.name }}\" style=\"width: {{ subscore.percentile * 100 }}%\">\n" +
    "                        </div>\n" +
    "\n" +
    "                    </div>\n" +
    "                    <span class=\"main-metric\" ng-show=\"subscore.name=='pagerank'\">\n" +
    "                        {{ format.short(subscore.val, 2) }}\n" +
    "                    </span>\n" +
    "                    <span class=\"main-metric\" ng-show=\"subscore.name != 'pagerank'\">\n" +
    "                        {{ format.short(subscore.val) }}\n" +
    "                    </span>\n" +
    "                    <span class=\"percentile\" ng-show=\"package.is_academic\">\n" +
    "                        <span class=\"val\">\n" +
    "                            {{ format.round(subscore.percentile * 100) }}\n" +
    "                        </span>\n" +
    "                        <span class=\"descr\">\n" +
    "                            percentile\n" +
    "                        </span>\n" +
    "                    </span>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"explanation\">\n" +
    "                    <div class=\"citations-explanation\" ng-show=\"subscore.name=='num_mentions'\">\n" +
    "                        Based on term searches in <br>\n" +
    "                            <span class=\"citation-link\" ng-repeat=\"link in package.citations_dict\">\n" +
    "                                <a href=\"{{ link.url }}\">{{ link.display_name }} ({{ link.count }})</a>\n" +
    "                                <span class=\"and\" ng-show=\"!$last\">and</span>\n" +
    "                            </span>\n" +
    "                    </div>\n" +
    "                    <div class=\"downloads-explanation\" ng-show=\"subscore.name=='num_downloads'\">\n" +
    "                        Based on latest monthly downloads stats from\n" +
    "                        <span class=\"repo cran\" ng-show=\"package.host=='cran'\">CRAN</span>\n" +
    "                        <span class=\"repo PyPi\" ng-show=\"package.host=='pypi'\">PyPi</span>\n" +
    "                    </div>\n" +
    "                    <div class=\"pagerank-explanation\" ng-show=\"subscore.name=='pagerank'\">\n" +
    "                        <p>\n" +
    "                            Measures how often this package is imported by\n" +
    "\n" +
    "                            <span class=\"repo cran\" ng-show=\"package.host=='cran'\">CRAN</span>\n" +
    "                            <span class=\"repo PyPi\" ng-show=\"package.host=='pypi'\">PyPi</span>\n" +
    "                            and GitHub projects, based on its PageRank in the dependency network.\n" +
    "\n" +
    "                        </p>\n" +
    "                        <p>\n" +
    "                            A higher number means this package is imported more frequently,\n" +
    "                            more uniquely, and by more important projects.\n" +
    "                        </p>\n" +
    "\n" +
    "\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "\n" +
    "\n" +
    "            </div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "            <!-- Top Importers. This is just for the pagerank subscore -->\n" +
    "            <div class=\"top-importers\" ng-show=\"subscore.name=='pagerank' && package.indegree\">\n" +
    "                <h4>\n" +
    "                    <i class=\"fa fa-recycle\"></i>\n" +
    "                    Reused by <span class=\"details\">{{ package.indegree }} projects</span>\n" +
    "                </h4>\n" +
    "\n" +
    "                <div class=\"dep-container\"\n" +
    "                     ng-repeat=\"dep in package.top_neighbors | orderBy: ['-is_github', '-impact']\">\n" +
    "\n" +
    "\n" +
    "                    <!-- CRAN or PyPi package -->\n" +
    "                    <div class=\"package dep\" ng-if=\"dep.host\">\n" +
    "                        <div class=\"top-line\">\n" +
    "\n" +
    "                            <div class=\"left-metrics is-academic\" ng-show=\"dep.is_academic\">\n" +
    "                                <div class=\"vis impact-stick is-academic-{{ dep.is_academic }}\">\n" +
    "                                    <div ng-repeat=\"subscore in dep.subscores\"\n" +
    "                                         class=\"bar-inner {{ subscore.name }}\"\n" +
    "                                         style=\"width: {{ subscore.percentile * 33.333 }}%;\">\n" +
    "                                    </div>\n" +
    "                                </div>\n" +
    "                            </div>\n" +
    "\n" +
    "\n" +
    "                            <span class=\"left-metrics not-academic\"\n" +
    "                                  ng-show=\"!dep.is_academic\"\n" +
    "                                  popover=\"Based on name, tags, and description, we're guessing this isn't research software—so we haven't collected detailed impact info.\"\n" +
    "                                  popover-trigger=\"mouseenter\">\n" +
    "                                <span class=\"non-research\">\n" +
    "                                    non- research\n" +
    "                                </span>\n" +
    "\n" +
    "                            </span>\n" +
    "\n" +
    "\n" +
    "                            <a class=\"name\" href=\"package/{{ dep.language }}/{{ dep.name }}\">\n" +
    "                                {{ dep.name }}\n" +
    "                            </a>\n" +
    "\n" +
    "                            <i popover-title=\"Research software\"\n" +
    "                               popover-trigger=\"mouseenter\"\n" +
    "                               popover=\"We decide projects are research software based on their names, tags, and summaries.\"\n" +
    "                               ng-show=\"dep.is_academic\"\n" +
    "                               class=\"is-academic fa fa-graduation-cap\"></i>\n" +
    "                        </div>\n" +
    "                        <div class=\"underline\">\n" +
    "                            {{ dep.summary }}\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <!-- GitHub repo -->\n" +
    "                    <div class=\"github dep\" ng-if=\"!dep.host\">\n" +
    "                        <div class=\"top-line\">\n" +
    "                            <div class=\"vis\"\n" +
    "                                 popover-trigger=\"mouseenter\"\n" +
    "                                 popover=\"{{ dep.stars }} GitHub stars\">\n" +
    "                                {{ dep.stars }}\n" +
    "                                <i class=\"fa fa-star\"></i>\n" +
    "                            </div>\n" +
    "\n" +
    "                            <span class=\"name\">\n" +
    "                                <a href=\"http://github.com/{{ dep.login }}/{{ dep.repo_name }}\"\n" +
    "                                   popover-trigger=\"mouseenter\"\n" +
    "                                   popover=\"This {{ dep.language }} project is not in CRAN or PyPi, but it is viewable on GitHub\"\n" +
    "                                   class=\"github-link\">\n" +
    "                                    <i class=\"fa fa-github\"></i>\n" +
    "                                </a>\n" +
    "                                {{ dep.repo_name }}\n" +
    "                            </span>\n" +
    "                        </div>\n" +
    "                        <div class=\"underline\">\n" +
    "                            {{ dep.summary }}\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                </div> <!-- end this dep -->\n" +
    "\n" +
    "                <span class=\"plus-more btn btn-default btn-xs\"\n" +
    "                      ng-show=\"package.indegree > package.top_neighbors.length\"\n" +
    "                      ng-click=\"apiOnly()\">\n" +
    "                    <i class=\"fa fa-plus\"></i>\n" +
    "                    <span class=\"val\">{{ package.indegree - package.top_neighbors.length }}</span> more\n" +
    "                </span>\n" +
    "\n" +
    "            </div> <!-- end of the dep list widget -->\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("person-page/person-page.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("person-page/person-page.tpl.html",
    "<div class=\"page entity-page person-page\">\n" +
    "    <div class=\"ti-page-sidebar\">\n" +
    "        <div class=\"sidebar-header\">\n" +
    "            <div class=\"person-about\">\n" +
    "                <img ng-src=\"{{ person.icon }}\" alt=\"\"/>\n" +
    "\n" +
    "            <span class=\"name\">\n" +
    "               {{ person.name }}\n" +
    "            </span>\n" +
    "            <span class=\"accounts\">\n" +
    "               <img class=\"orcid account\"\n" +
    "                    popover-title=\"ORCiD coming soon\"\n" +
    "                    popover-trigger=\"mouseenter\"\n" +
    "                    popover=\"ORCiD is a unique identifier for researchers. We'll be rolling out support soon.\"\n" +
    "                    src=\"static/img/orcid.gif\" alt=\"\"/>\n" +
    "\n" +
    "               <a class=\"account\" ng-if=\"person.github_login\" href=\"http://github.com/{{ person.github_login }}\">\n" +
    "                   <i class=\"fa fa-github\"></i> github/{{ person.github_login }}\n" +
    "               </a>\n" +
    "            </span>\n" +
    "\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "\n" +
    "        <div class=\"sidebar-section impact\" ng-show=\"person.impact_percentile\">\n" +
    "            <h3>\n" +
    "             <span class=\"val\">\n" +
    "                 {{ format.round(person.impact_percentile * 100) }}\n" +
    "             </span>\n" +
    "                <span class=\"unit\">percentile impact</span></h3>\n" +
    "          <span class=\"descr\">\n" +
    "              Aggregated fractional credit, summed across all research software contributions\n" +
    "          </span>\n" +
    "            <div class=\"vis\">\n" +
    "                <div class=\"subscore {{ subscore.name }}\"\n" +
    "                     ng-if=\"subscore.val > 0\"\n" +
    "                     ng-repeat=\"subscore in person.subscores\">\n" +
    "                    <div class=\"bar-outer\">\n" +
    "                        <div class=\"bar-inner {{ subscore.name }}\" style=\"width: {{ subscore.percentile  * 100 }}%;\"></div>\n" +
    "                    </div>\n" +
    "                    <div class=\"subscore-label\">\n" +
    "                        <span class=\"val pagerank\" ng-show=\"subscore.name=='pagerank'\">{{ format.short(subscore.val, 2) }}</span>\n" +
    "                        <span class=\"val\" ng-show=\"subscore.name != 'pagerank'\">{{ format.short(subscore.val) }}</span>\n" +
    "                        <span class=\"text\">{{ subscore.display_name }}</span>\n" +
    "                    </div>\n" +
    "\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "        <!--\n" +
    "      <div class=\"impact-descr\" ng-if=\"!person.is_organization\">\n" +
    "         <h3>Impact</h3>\n" +
    "         <div class=\"impact-copy\" ng-show=\"person.main_language=='python'\">\n" +
    "            Ranked #{{ format.commas(person.impact_rank) }} in impact out of {{ format.commas(person.impact_rank_max) }} Pythonistas on PyPi. That's based on summed package impacts, adjusted by percent contributions.\n" +
    "         </div>\n" +
    "         <div class=\"impact-copy\" ng-show=\"person.main_language=='r'\">\n" +
    "            Ranked #{{ person.impact_rank }} in impact out of {{ person.impact_rank_max }} R coders on CRAN. That's based on summed package impacts, adjusted by percent contributions.\n" +
    "         </div>\n" +
    "      </div>\n" +
    "      -->\n" +
    "\n" +
    "        <div class=\"top-tags\" ng-if=\"person.top_person_tags.length\">\n" +
    "            <h3>Top tags</h3>\n" +
    "            <div class=\"tags\">\n" +
    "                <a class=\"tag\"\n" +
    "                   href=\"tag/{{ format.doubleUrlEncode(tag.name) }}\"\n" +
    "                   ng-repeat=\"tag in person.top_person_tags | orderBy: '-count'\">\n" +
    "                    {{ tag.name }}\n" +
    "                </a>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"top-collabs\" ng-show=\"person.top_collabs.length\">\n" +
    "            <h3>\n" +
    "                Top collaborators\n" +
    "            </h3>\n" +
    "            <div class=\"top-collabs-list\">\n" +
    "                <a class=\"collab person-mini\"\n" +
    "                   href=\"person/{{ collab.id }}\"\n" +
    "                   ng-repeat=\"collab in person.top_collabs | orderBy: '-collab_score'\">\n" +
    "\n" +
    "                    <div class=\"vis impact-stick\">\n" +
    "                        <div class=\"none\" ng-show=\"collab.subscores.length == 0\">\n" +
    "                            none\n" +
    "                        </div>\n" +
    "                        <div class=\"bar-inner {{ subscore.name }}\"\n" +
    "                             style=\"width: {{ subscore.percentile * 33.33333 }}%;\"\n" +
    "                             ng-repeat=\"subscore in collab.subscores\">\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "                    <!--\n" +
    "               <img src=\"{{ collab.icon_small }}\" alt=\"\"/>\n" +
    "               <span class=\"impact\">{{ format.short(collab.impact) }}</span>\n" +
    "               -->\n" +
    "                    <span class=\"name\">{{ collab.name }}</span>\n" +
    "\n" +
    "                </a>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"sidebar-section actions\">\n" +
    "            <a class=\"json-link btn btn-default\"\n" +
    "               target=\"_self\"\n" +
    "               href=\"api/person/{{ person.id }}\">\n" +
    "                <i class=\"fa fa-cogs\"></i>\n" +
    "                View in API\n" +
    "            </a>\n" +
    "            <badge entity=\"person/{{ person.id }}\"></badge>\n" +
    "        </div>\n" +
    "\n" +
    "\n" +
    "    </div>\n" +
    "\n" +
    "\n" +
    "    <div class=\"ti-page-body\">\n" +
    "\n" +
    "        <div class=\"packages\">\n" +
    "            <div class=\"person-package\" ng-repeat=\"package in person.person_packages | orderBy:'-person_package_impact'\">\n" +
    "                <div class=\"person-package-stats\">\n" +
    "                    <wheel></wheel>\n" +
    "\n" +
    "                </div>\n" +
    "                <span class=\"package-snippet-wrapper\" ng-include=\"'snippet/package-snippet.tpl.html'\"></span>\n" +
    "            </div>\n" +
    "\n" +
    "\n" +
    "        </div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "    </div>\n" +
    "\n" +
    "</div>\n" +
    "");
}]);

angular.module("snippet/package-impact-popover.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("snippet/package-impact-popover.tpl.html",
    "<div class=\"package impact-popover\">\n" +
    "    <div class=\"impact\">\n" +
    "\n" +
    "        <div class=\"overall\">\n" +
    "            <span class=\"val-plus-label\">\n" +
    "                <span class=\"val\">\n" +
    "                    {{ format.round(package.impact_percentile * 100) }}\n" +
    "                </span>\n" +
    "                <span class=\"ti-label\">percentile <br> overall impact</span>\n" +
    "\n" +
    "            </span>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"based-on\">\n" +
    "            Compared to other <span class=\"language\">{{ package.language }}</span> research software projects, based on:\n" +
    "        </div>\n" +
    "\n" +
    "        <!-- repeat for each subscore -->\n" +
    "        <div class=\"subscore {{ subscore.name }} metric\"\n" +
    "             ng-if=\"subscore.val > 0\"\n" +
    "             ng-repeat=\"subscore in package.subscores\">\n" +
    "\n" +
    "            <span class=\"bar-outer\">\n" +
    "                <span class=\"bar-inner {{ subscore.name }}\" style=\"width: {{ subscore.percentile * 100 }}%\"></span>\n" +
    "            </span>\n" +
    "\n" +
    "            <span class=\"val pagerank\" ng-if=\"subscore.name=='pagerank'\">{{ format.short(subscore.val, 2) }}</span>\n" +
    "            <span class=\"val\" ng-if=\"subscore.name != 'pagerank'\">{{ format.short(subscore.val) }}</span>\n" +
    "            <span class=\"name\">{{ subscore.display_name }}</span>\n" +
    "        </div>\n" +
    "\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("snippet/package-snippet.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("snippet/package-snippet.tpl.html",
    "<span class=\"snippet package-snippet is-academic-{{ package.is_academic }}\"\n" +
    "     ng-controller=\"packageSnippetCtrl\">\n" +
    "\n" +
    "    <span class=\"left-metrics is-academic\"\n" +
    "          ng-show=\"package.is_academic\"\n" +
    "          popover-trigger=\"mouseenter\"\n" +
    "          popover-placement=\"bottom\"\n" +
    "         popover-template=\"'snippet/package-impact-popover.tpl.html'\">\n" +
    "\n" +
    "      <div class=\"vis impact-stick\">\n" +
    "            <div ng-repeat=\"subscore in package.subscores\"\n" +
    "                 class=\"bar-inner {{ subscore.name }}\"\n" +
    "                 style=\"width: {{ subscore.percentile * 33.3333 }}%;\">\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "      <div class=\"rank\">\n" +
    "         <span class=\"val\">\n" +
    "            {{ format.round(package.impact_percentile * 100) }}\n" +
    "         </span>\n" +
    "      </div>\n" +
    "\n" +
    "   </span>\n" +
    "\n" +
    "\n" +
    "    <span class=\"left-metrics not-academic\"\n" +
    "          ng-show=\"!package.is_academic\"\n" +
    "          popover=\"Based on name, tags, and description, we're guessing this isn't research software—so we haven't collected detailed impact info.\"\n" +
    "          popover-placement=\"bottom\"\n" +
    "          popover-trigger=\"mouseenter\">\n" +
    "        <span class=\"non-research\">\n" +
    "            non- research\n" +
    "        </span>\n" +
    "\n" +
    "    </span>\n" +
    "\n" +
    "\n" +
    "   <span class=\"metadata is-academic-{{ package.is_academic }}\">\n" +
    "      <span class=\"name-container\">\n" +
    "\n" +
    "         <span class=\"icon\">\n" +
    "            <span class=\"language-icon r\"\n" +
    "                  ng-if=\"package.language=='r'\">\n" +
    "               R\n" +
    "            </span>\n" +
    "            <span class=\"language-icon python\"\n" +
    "                  ng-if=\"package.language=='python'\">\n" +
    "               py\n" +
    "            </span>\n" +
    "         </span>\n" +
    "\n" +
    "\n" +
    "         <a class=\"name\" href=\"package/{{ package.language }}/{{ package.name }}\">\n" +
    "            {{ package.name }}\n" +
    "         </a>\n" +
    "         <i popover-title=\"Research software\"\n" +
    "            popover-trigger=\"mouseenter\"\n" +
    "            popover=\"We decide projects are research software based on their names, tags, and summaries.\"\n" +
    "            ng-show=\"package.is_academic\"\n" +
    "            class=\"is-academic fa fa-graduation-cap\"></i>\n" +
    "\n" +
    "\n" +
    "         <span class=\"contribs\">\n" +
    "            <span class=\"by\">by</span>\n" +
    "            <a href=\"person/{{ contrib.id }}\"\n" +
    "               popover=\"{{ contrib.name }}\"\n" +
    "               popover-trigger=\"mouseenter\"\n" +
    "               class=\"contrib\"\n" +
    "               ng-repeat=\"contrib in package.top_contribs | orderBy: '-credit' | limitTo: 3\">{{ contrib.single_name }}<span\n" +
    "                       ng-hide=\"{{ $last }}\"\n" +
    "                       class=\"comma\">, </span></a><a class=\"contrib plus-more\"\n" +
    "               href=\"package/{{ package.language }}/{{ package.name }}\"\n" +
    "                  popover=\"click to see all {{ package.num_contribs }} contributors\"\n" +
    "                  popover-trigger=\"mouseenter\" ng-show=\"package.num_contribs > 3\">,\n" +
    "               and {{ package.num_contribs - 3 }} others\n" +
    "            </a>\n" +
    "         </span>\n" +
    "\n" +
    "\n" +
    "\n" +
    "      </span>\n" +
    "      <span class=\"summary\">{{ package.summary }}</span>\n" +
    "   </span>\n" +
    "\n" +
    "\n" +
    "\n" +
    "</span>\n" +
    "\n" +
    "\n" +
    "");
}]);

angular.module("snippet/person-impact-popover.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("snippet/person-impact-popover.tpl.html",
    "<div class=\"person impact-popover\">\n" +
    "   <div class=\"impact\">\n" +
    "       Based on aggregated fractional credit across all research software.\n" +
    "       More details coming soon...\n" +
    "\n" +
    "      <div class=\"sub-score citations metric\" ng-show=\"package.num_citations\">\n" +
    "         <span class=\"name\">\n" +
    "            <i class=\"fa fa-file-text-o\"></i>\n" +
    "            Citations\n" +
    "         </span>\n" +
    "         <span class=\"descr\">\n" +
    "            <span class=\"val\">{{ package.num_citations }}</span>\n" +
    "         </span>\n" +
    "      </div>\n" +
    "\n" +
    "      <div class=\"sub-score pagerank metric\" ng-show=\"package.pagerank\">\n" +
    "         <span class=\"name\">\n" +
    "            <i class=\"fa fa-exchange\"></i>\n" +
    "            Dependency PageRank\n" +
    "         </span>\n" +
    "         <span class=\"descr\">\n" +
    "            <span class=\"val\">{{ format.short(package.pagerank_score) }} </span>\n" +
    "         </span>\n" +
    "      </div>\n" +
    "\n" +
    "      <div class=\"sub-score downloads metric\" ng-show=\"package.num_downloads\">\n" +
    "         <span class=\"name\">\n" +
    "            <i class=\"fa fa-download\"></i>\n" +
    "            Monthly Downloads\n" +
    "         </span>\n" +
    "         <span class=\"descr\">\n" +
    "            <span class=\"val\">{{ format.short(package.num_downloads)}}</span>\n" +
    "         </span>\n" +
    "      </div>\n" +
    "\n" +
    "\n" +
    "   </div>\n" +
    "</div>");
}]);

angular.module("snippet/person-mini.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("snippet/person-mini.tpl.html",
    "<span class=\"person-mini-insides\"\n" +
    "   <img src=\"{{ contrib.icon_small }}\" alt=\"\"/>\n" +
    "   <span class=\"impact\">{{ format.short(contrib.impact) }}</span>\n" +
    "   <span class=\"name\">{{ contrib.name }}</span>\n" +
    "</span>");
}]);

angular.module("snippet/person-snippet.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("snippet/person-snippet.tpl.html",
    "<span class=\"snippet person-snippet\"\n" +
    "     ng-controller=\"personSnippetCtrl\">\n" +
    "   <span class=\"left-metrics\"\n" +
    "         popover-placement=\"top\"\n" +
    "         popover-title=\"Impact\"\n" +
    "         popover-trigger=\"mouseenter\"\n" +
    "         popover-template=\"'snippet/person-impact-popover.tpl.html'\">\n" +
    "\n" +
    "\n" +
    "      <div class=\"vis impact-stick\">\n" +
    "         <div class=\"bar-inner {{ subscore.name }}\"\n" +
    "              style=\"width: {{ subscore.percentile * 33.33333 }}%;\"\n" +
    "              ng-repeat=\"subscore in person.subscores\">\n" +
    "         </div>\n" +
    "      </div>\n" +
    "\n" +
    "      <span class=\"rank\">\n" +
    "         {{ format.round(person.impact_percentile * 100) }}\n" +
    "      </span>\n" +
    "\n" +
    "   </span>\n" +
    "\n" +
    "\n" +
    "   <span class=\"metadata\">\n" +
    "      <span class=\"name-container\">\n" +
    "\n" +
    "\n" +
    "         <span class=\"icon\">\n" +
    "            <img class=\"person-icon\" src=\"{{ person.icon_small }}\" alt=\"\"/>\n" +
    "         </span>\n" +
    "\n" +
    "\n" +
    "\n" +
    "         <a class=\"name\" href=\"person/{{ person.id }}\">\n" +
    "            {{ person.name }}\n" +
    "         </a>\n" +
    "\n" +
    "\n" +
    "         <span class=\"person-packages\">\n" +
    "            <span class=\"works-on\">{{ person.num_packages }} packages including: </span>\n" +
    "            <span class=\"package\" ng-repeat=\"package in person.person_packages | orderBy: '-person_package_impact'\">\n" +
    "               <a href=\"package/{{ package.language }}/{{ package.name }}\">\n" +
    "                  {{ package.name }}</a><span class=\"sep\" ng-show=\"!$last\">,</span>\n" +
    "            </span>\n" +
    "         </span>\n" +
    "      </span>\n" +
    "\n" +
    "      <span class=\"summary tags\">\n" +
    "         <span class=\"tags\">\n" +
    "            <a href=\"tag/{{ format.doubleUrlEncode(tag.name) }}\"\n" +
    "               class=\"tag\"\n" +
    "               ng-repeat=\"tag in person.top_person_tags | orderBy: '-count'\">\n" +
    "               {{ tag.name }}\n" +
    "            </a>\n" +
    "         </span>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "      </span>\n" +
    "   </span>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "</span>\n" +
    "\n" +
    "\n" +
    "");
}]);

angular.module("snippet/tag-snippet.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("snippet/tag-snippet.tpl.html",
    "<span class=\"snippet tag-snippet\"\n" +
    "     ng-controller=\"personSnippetCtrl\">\n" +
    "<span class=\"left-metrics\"\n" +
    "         popover-trigger=\"mouseenter\"\n" +
    "         popover=\"{{ tag.count }} packages are tagged with '{{ tag.name }}'\">\n" +
    "\n" +
    "      <span class=\"one-metric metric\">\n" +
    "         {{ format.short(tag.count) }}\n" +
    "      </span>\n" +
    "\n" +
    "   </span>\n" +
    "\n" +
    "   <span class=\"metadata\">\n" +
    "      <span class=\"name-container\">\n" +
    "\n" +
    "         <span class=\"icon tag-icon\">\n" +
    "            <i class=\"fa fa-tag\"></i>\n" +
    "         </span>\n" +
    "\n" +
    "         <a class=\"name\"\n" +
    "            href=\"tag/{{ format.doubleUrlEncode( tag.name ) }}\">\n" +
    "            {{ tag.name }}\n" +
    "         </a>\n" +
    "\n" +
    "\n" +
    "         <i popover-title=\"Research software\"\n" +
    "            popover-trigger=\"mouseenter\"\n" +
    "            popover=\"This tag is often applied to academic projects.\"\n" +
    "            ng-show=\"tag.is_academic\"\n" +
    "            class=\"is-academic fa fa-graduation-cap\"></i>\n" +
    "\n" +
    "      </span>\n" +
    "\n" +
    "      <span class=\"summary tags\">\n" +
    "         <span class=\"tags\">\n" +
    "            related tags:\n" +
    "            <a href=\"tag/{{ format.doubleUrlEncode( relatedTag.name ) }}\"\n" +
    "               class=\"tag\"\n" +
    "               ng-repeat=\"relatedTag in tag.related_tags | orderBy: '-count'\">\n" +
    "               {{ relatedTag.name }}\n" +
    "            </a>\n" +
    "         </span>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "      </span>\n" +
    "   </span>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "</span>\n" +
    "\n" +
    "\n" +
    "");
}]);

angular.module("static-pages/about.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("static-pages/about.tpl.html",
    "<div class=\"about-page static-page\">\n" +
    "\n" +
    "   <div class=\"coming-soon\">\n" +
    "      <h1>Coming soon:</h1>\n" +
    "      <h2>So many things! We're adding so much over the next few days.</h2>\n" +
    "       <h3>follow us at <a href=\"http://twitter.com/depsy_org\">@depsy_org</a> for updates!</h3>\n" +
    "   </div>\n" +
    "\n" +
    "    <div id=\"readme\" ng-bind-html=\"readme\"></div>\n" +
    "\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "");
}]);

angular.module("static-pages/landing.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("static-pages/landing.tpl.html",
    "<div class=\"landing static-page\">\n" +
    "   <div class=\"tagline\">\n" +
    "      foo Find the impact of software packages for Python and R.\n" +
    "   </div>\n" +
    "\n" +
    "\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "");
}]);

angular.module("tag-page/tag-page.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tag-page/tag-page.tpl.html",
    "<div class=\"page entity-page tag-page\">\n" +
    "   <div class=\"ti-page-sidebar\">\n" +
    "      <div class=\"sidebar-header\">\n" +
    "\n" +
    "         <div class=\"tag-about\">\n" +
    "            <span class=\"name\">\n" +
    "               <i class=\"fa fa-tag\"></i>\n" +
    "               {{ packages.filters.tag }}\n" +
    "            </span>\n" +
    "            <span class=\"num-tags\">\n" +
    "               Showing {{ packages.num_returned }} of {{ packages.num_total }} uses\n" +
    "            </span>\n" +
    "         </div>\n" +
    "\n" +
    "      </div>\n" +
    "\n" +
    "      <div class=\"top-tags\">\n" +
    "         <h3>Related tags</h3>\n" +
    "         <div class=\"tags\">\n" +
    "            <a class=\"tag\" href=\"tag/{{ format.doubleUrlEncode( tag.name ) }}\" ng-repeat=\"tag in packages.related_tags | orderBy: '-count'\">\n" +
    "               {{ tag.name }}\n" +
    "            </a>\n" +
    "         </div>\n" +
    "      </div>\n" +
    "\n" +
    "      <a class=\"json-link btn btn-default\"\n" +
    "         target=\"_self\"\n" +
    "         href=\"api/leaderboard?type=packages&tag={{ packages.filters.tag }}\">\n" +
    "         <i class=\"fa fa-cogs\"></i>\n" +
    "                View in API\n" +
    "      </a>\n" +
    "\n" +
    "      <!-- we can use this from the people page to print out tag users...\n" +
    "      <div class=\"top-collabs\">\n" +
    "         <h3>Top collaborators</h3>\n" +
    "         <div class=\"tags\">\n" +
    "            <a class=\"collab\"\n" +
    "               popover=\"We collaborated\"\n" +
    "               popover-trigger=\"mouseenter\"\n" +
    "               popover-title=\"Top collaborator\"\n" +
    "               href=\"person/{{ collab.id }}\"\n" +
    "               ng-repeat=\"collab in person.top_collabs | orderBy: '-collab_score'\">\n" +
    "               <img src=\"{{ collab.icon_small }}\" alt=\"\"/>\n" +
    "               <span class=\"impact\">{{ format.short(collab.impact) }}</span>\n" +
    "               <span class=\"name\">{{ collab.name }}</span>\n" +
    "               <span class=\"is-academic\" ng-show=\"collab.is_academic\"><i class=\"fa fa-graduation-cap\"></i></span>\n" +
    "\n" +
    "            </a>\n" +
    "         </div>\n" +
    "      </div>\n" +
    "      -->\n" +
    "\n" +
    "   </div>\n" +
    "\n" +
    "\n" +
    "   <div class=\"ti-page-body\">\n" +
    "      <div class=\"packages\">\n" +
    "         <div class=\"person-package\" ng-repeat=\"package in packages.list | orderBy:'-impact'\">\n" +
    "            <span class=\"package-snippet-wrapper\" ng-include=\"'snippet/package-snippet.tpl.html'\"></span>\n" +
    "         </div>\n" +
    "      </div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "   </div>\n" +
    "\n" +
    "</div>\n" +
    "");
}]);

angular.module("top/top.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("top/top.tpl.html",
    "<div class=\"page leaderboard\">\n" +
    "\n" +
    "\n" +
    "\n" +
    "   <div class=\"sidebar\">\n" +
    "\n" +
    "      <div class=\"leader-type-select facet\">\n" +
    "         <h3>Show me</h3>\n" +
    "         <ul>\n" +
    "            <li class=\"filter-option\" ng-click=\"filters.set('type', 'people')\">\n" +
    "               <span class=\"status\" ng-if=\"filters.d.type == 'people'\">\n" +
    "                  <i class=\"fa fa-check-square-o\"></i>\n" +
    "               </span>\n" +
    "               <span class=\"status\" ng-if=\"filters.d.type != 'people'\">\n" +
    "                  <i class=\"fa fa-square-o\"></i>\n" +
    "               </span>\n" +
    "\n" +
    "               <span class=\"text\">authors</span>\n" +
    "            </li>\n" +
    "\n" +
    "            <li class=\"filter-option\" ng-click=\"filters.set('type', 'packages')\">\n" +
    "               <span class=\"status\" ng-if=\"filters.d.type == 'packages'\">\n" +
    "                  <i class=\"fa fa-check-square-o\"></i>\n" +
    "               </span>\n" +
    "               <span class=\"status\" ng-if=\"filters.d.type != 'packages'\">\n" +
    "                  <i class=\"fa fa-square-o\"></i>\n" +
    "               </span>\n" +
    "\n" +
    "               <span class=\"text\">packages</span>\n" +
    "            </li>\n" +
    "\n" +
    "            <li class=\"filter-option\" ng-click=\"filters.set('type', 'tags')\">\n" +
    "               <span class=\"status\" ng-if=\"filters.d.type == 'tags'\">\n" +
    "                  <i class=\"fa fa-check-square-o\"></i>\n" +
    "               </span>\n" +
    "               <span class=\"status\" ng-if=\"filters.d.type != 'tags'\">\n" +
    "                  <i class=\"fa fa-square-o\"></i>\n" +
    "               </span>\n" +
    "\n" +
    "               <span class=\"text\">topics</span>\n" +
    "            </li>\n" +
    "         </ul>\n" +
    "\n" +
    "      </div>\n" +
    "\n" +
    "      <div class=\"language-type-select facet\">\n" +
    "         <h3 ng-show=\"filters.d.type=='packages'\">written in</h3>\n" +
    "         <h3 ng-show=\"filters.d.type=='people'\">who work in</h3>\n" +
    "         <h3 ng-show=\"filters.d.type=='tags'\">applied to</h3>\n" +
    "         <ul>\n" +
    "            <li class=\"filter-option\" ng-click=\"filters.set('language', 'python')\">\n" +
    "               <span class=\"status\" ng-if=\"filters.d.language == 'python'\">\n" +
    "                  <i class=\"fa fa-check-square-o\"></i>\n" +
    "               </span>\n" +
    "               <span class=\"status\" ng-if=\"filters.d.language != 'python'\">\n" +
    "                  <i class=\"fa fa-square-o\"></i>\n" +
    "               </span>\n" +
    "\n" +
    "               <span class=\"text\">Python</span>\n" +
    "            </li>\n" +
    "\n" +
    "            <li class=\"filter-option\" ng-click=\"filters.set('language', 'r')\">\n" +
    "               <span class=\"status\" ng-if=\"filters.d.language == 'r'\">\n" +
    "                  <i class=\"fa fa-check-square-o\"></i>\n" +
    "               </span>\n" +
    "               <span class=\"status\" ng-if=\"filters.d.language != 'r'\">\n" +
    "                  <i class=\"fa fa-square-o\"></i>\n" +
    "               </span>\n" +
    "\n" +
    "               <span class=\"text\">R</span>\n" +
    "            </li>\n" +
    "         </ul>\n" +
    "      </div>\n" +
    "\n" +
    "\n" +
    "      <a class=\"json-link btn btn-default\"\n" +
    "         target=\"_self\"\n" +
    "         href=\"api/leaderboard?{{ filters.asQueryStr() }}\">\n" +
    "         <i class=\"fa fa-cogs\"></i>\n" +
    "                View in API\n" +
    "      </a>\n" +
    "\n" +
    "\n" +
    "\n" +
    "   </div>\n" +
    "\n" +
    "   <div class=\"main\">\n" +
    "\n" +
    "      <div class=\"ti-page-header leaderboard-header\">\n" +
    "\n" +
    "         <h2>\n" +
    "            <span class=\"icons\">\n" +
    "               <!-- put icons here based on filters -->\n" +
    "            </span>\n" +
    "            <span class=\"text\">\n" +
    "                <span class=\"same\">\n" +
    "                    <span class=\"top\">Top <span class=\"language\"><span class=\"name\">{{ filters.d.language }}</span> language</span></span>\n" +
    "                </span>\n" +
    "                 <span class=\"people\" ng-show=\"filters.d.type=='people'\">\n" +
    "                     Research software authors\n" +
    "                 </span>\n" +
    "                  <span class=\"packages\" ng-show=\"filters.d.type=='packages'\">\n" +
    "                      Research software projects\n" +
    "                  </span>\n" +
    "                 <span class=\"people\" ng-show=\"filters.d.type=='tags'\">\n" +
    "                     Research software topics\n" +
    "                 </span>\n" +
    "\n" +
    "            </span>\n" +
    "         </h2>\n" +
    "\n" +
    "         <div class=\"descr\">\n" +
    "             Based on <a href=\"about#citation\">citations</a>,\n" +
    "             <a href=\"about#downloads\">\n" +
    "                 <span class=\"pypi\" ng-show=\"filters.d.language=='python'\">PyPi</span>\n" +
    "                 <span class=\"cran\" ng-show=\"filters.d.language=='r'\">CRAN</span>\n" +
    "                 downloads\n" +
    "             </a>, and\n" +
    "             <a href=\"about#reuse\">reuse in other software.</a>\n" +
    "         </div>\n" +
    "      </div>\n" +
    "\n" +
    "\n" +
    "      <div class=\"content\">\n" +
    "         <div class=\"list-items\">\n" +
    "            <!-- packages loop -->\n" +
    "            <div ng-if=\"filters.d.type=='packages'\" class=\"leader\" ng-repeat=\"package in leaders.list\">\n" +
    "               <div class=\"package-snippet-wrapper\"  ng-include=\"'snippet/package-snippet.tpl.html'\"></div>\n" +
    "            </div>\n" +
    "\n" +
    "            <!-- people loop -->\n" +
    "            <div ng-if=\"filters.d.type=='people'\" class=\"leader\" ng-repeat=\"person in leaders.list\">\n" +
    "               <div class=\"package-snippet-wrapper\"  ng-include=\"'snippet/person-snippet.tpl.html'\"></div>\n" +
    "            </div>\n" +
    "\n" +
    "            <!-- tag loop -->\n" +
    "            <div ng-if=\"filters.d.type=='tags'\" class=\"leader\" ng-repeat=\"tag in leaders.list\">\n" +
    "               <div class=\"package-snippet-wrapper\"  ng-include=\"'snippet/tag-snippet.tpl.html'\"></div>\n" +
    "            </div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "         </div>\n" +
    "      </div>\n" +
    "\n" +
    "   </div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "</div>");
}]);
