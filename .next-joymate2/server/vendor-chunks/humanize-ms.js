"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/humanize-ms";
exports.ids = ["vendor-chunks/humanize-ms"];
exports.modules = {

/***/ "(rsc)/./node_modules/humanize-ms/index.js":
/*!*******************************************!*\
  !*** ./node_modules/humanize-ms/index.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("/*!\r\n * humanize-ms - index.js\r\n * Copyright(c) 2014 dead_horse <dead_horse@qq.com>\r\n * MIT Licensed\r\n */\r\n\r\n\r\n\r\n/**\r\n * Module dependencies.\r\n */\r\n\r\nvar util = __webpack_require__(/*! util */ \"util\");\r\nvar ms = __webpack_require__(/*! ms */ \"(rsc)/./node_modules/ms/index.js\");\r\n\r\nmodule.exports = function (t) {\r\n  if (typeof t === 'number') return t;\r\n  var r = ms(t);\r\n  if (r === undefined) {\r\n    var err = new Error(util.format('humanize-ms(%j) result undefined', t));\r\n    console.warn(err.stack);\r\n  }\r\n  return r;\r\n};\r\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvaHVtYW5pemUtbXMvaW5kZXguanMiLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ2E7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxtQkFBTyxDQUFDLGtCQUFNO0FBQ3pCLFNBQVMsbUJBQU8sQ0FBQyw0Q0FBSTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsiRDpcXEpveU1hdGVcXG5vZGVfbW9kdWxlc1xcaHVtYW5pemUtbXNcXGluZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIVxyXG4gKiBodW1hbml6ZS1tcyAtIGluZGV4LmpzXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IGRlYWRfaG9yc2UgPGRlYWRfaG9yc2VAcXEuY29tPlxyXG4gKiBNSVQgTGljZW5zZWRcclxuICovXHJcblxyXG4ndXNlIHN0cmljdCc7XHJcblxyXG4vKipcclxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cclxuICovXHJcblxyXG52YXIgdXRpbCA9IHJlcXVpcmUoJ3V0aWwnKTtcclxudmFyIG1zID0gcmVxdWlyZSgnbXMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHQpIHtcclxuICBpZiAodHlwZW9mIHQgPT09ICdudW1iZXInKSByZXR1cm4gdDtcclxuICB2YXIgciA9IG1zKHQpO1xyXG4gIGlmIChyID09PSB1bmRlZmluZWQpIHtcclxuICAgIHZhciBlcnIgPSBuZXcgRXJyb3IodXRpbC5mb3JtYXQoJ2h1bWFuaXplLW1zKCVqKSByZXN1bHQgdW5kZWZpbmVkJywgdCkpO1xyXG4gICAgY29uc29sZS53YXJuKGVyci5zdGFjayk7XHJcbiAgfVxyXG4gIHJldHVybiByO1xyXG59O1xyXG4iXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbMF0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/humanize-ms/index.js\n");

/***/ })

};
;