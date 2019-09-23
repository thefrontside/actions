module.exports =
/******/ (function(modules, runtime) { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	__webpack_require__.ab = __dirname + "/";
/******/
/******/ 	// the startup function
/******/ 	function startup() {
/******/ 		// Load entry module and return exports
/******/ 		return __webpack_require__(513);
/******/ 	};
/******/
/******/ 	// run startup
/******/ 	return startup();
/******/ })
/************************************************************************/
/******/ ({

/***/ 513:
/***/ (function(__unusedmodule, __unusedexports, __webpack_require__) {

const core = __webpack_require__(739);

const labels = core.getInput('PR_LABELS');

async function run() {
  try {
    if (labels != null) {
      if (labels.includes('major')) {
        core.setFailed('Major releases should be done manually.')
      } else if (labels.includes('minor')) {
        core.exportVariable('MAJOR_OR_MINOR_OR_PATCH', 'minor');
      } else if (labels.includes('patch') && !labels.includes('minor')) {
        core.exportVariable('MAJOR_OR_MINOR_OR_PATCH', 'patch');
      } else {
        console.log("There were no applicable labels so resorting to 'patch'.")
        core.exportVariable('MAJOR_OR_MINOR_OR_PATCH', 'patch');
      }
    } else {
      console.log("There were no labels in the last merged PR. Defaulting to patch.")
      core.exportVariable('MAJOR_OR_MINOR_OR_PATCH', 'patch');
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();

/***/ }),

/***/ 739:
/***/ (function() {

eval("require")("@actions/core");


/***/ })

/******/ });