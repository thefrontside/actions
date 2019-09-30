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
const github = __webpack_require__(646);

const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
const octokit = new github.GitHub(GITHUB_TOKEN);

async function run() {
  try {
    const pullrequests = await octokit.pulls.list({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      state: 'closed', //because we only care about merged
      base: github.context.ref
    });
    console.log(pullrequests)
    // const lastmerged = pullrequests.data.filter((pr) => { return pr.merged_at != null })[0];

    // console.log("Retrieving labels from merge #" + lastmerged.number + ".");

    // const labels = lastmerged.labels.map(labels => { return labels.name });

    // core.setOutput('PR_LABELS', labels);
  } catch (error) {
    core.setFailed(error.message);
  };
};

run();

/***/ }),

/***/ 646:
/***/ (function() {

eval("require")("@actions/github");


/***/ }),

/***/ 739:
/***/ (function() {

eval("require")("@actions/core");


/***/ })

/******/ });