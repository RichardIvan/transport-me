import 'babel-polyfill'
// require('babel-polyfill')

// index.js
import Vue from 'vue'
// var Vue = require('vue')
// require a *.vue component
import App from './components/App.vue'
// var App = require('./components/App.vue')

// mount a root Vue instance
new Vue({
  el: 'body',
  components: {
    // include the required component
    // in the options
    app: App
  }
})


// require('../scss/main.scss')
// require('./modernizr.js')
// let $ = require('./jquery.js')

// var MyWorker = require("worker!./file.js");

// require('imports?this=>window!modernizr/modernizr.js');
// require('imports?this=>window!https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js')
