angular.module("formatterService", [])

.factory("FormatterService", function($location){

  var commas = function(x) { // from stackoverflow
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

  var short = function(num){
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

      if (num < .01) {
        return num.toExponential(1)
      }
      if (num < 1) {
        return Math.round(num * 100) / 100
      }

      return Math.floor(num);
  }

  var round = function(num){
    return Math.round(num)
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
    ordinal: ordinal

  }
});