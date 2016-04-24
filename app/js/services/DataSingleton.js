'use strict'

let DataSingleton = (function () {
 
  // options: an object containing configuration options for the singleton
  // e.g var options = { name: "test", pointX: 5};
  function Singleton( options ) {

    const lines = fetch('/data').then(response => response.json())
 
    // set options to the options supplied
    // or an empty object if none are provided
    options = options || {};
 
    // set some properties for our singleton
    this.name = "SingletonTester";
 
    this.pointX = options.pointX || 6;
 
    this.pointY = options.pointY || 10;

    this.getLines = function() {
      return lines
    }
 
  }

  Singleton.prototype.getJourney = function( options ) {
    this.getLines().then((lines) => console.log(lines))
  }
 
  // our instance holder
  var instance;
 
  // an emulation of static variables and methods
  var _static = {
 
    name: "DataSingleton",
 
    // Method for getting an instance. It returns
    // a singleton instance of a singleton object
    getInstance: function( options ) {
      if( instance === undefined ) {
        instance = new Singleton( options );
      }
 
      return instance;
 
    }
  };
 
  return _static;
 
})();
 
export default DataSingleton
 
// Log the output of pointX just to verify it is correct
// Outputs: 5
// console.log( singletonTest.pointX );