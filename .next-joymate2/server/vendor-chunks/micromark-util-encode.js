"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/micromark-util-encode";
exports.ids = ["vendor-chunks/micromark-util-encode"];
exports.modules = {

/***/ "(ssr)/./node_modules/micromark-util-encode/index.js":
/*!*****************************************************!*\
  !*** ./node_modules/micromark-util-encode/index.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   encode: () => (/* binding */ encode)\n/* harmony export */ });\nconst characterReferences = {'\"': 'quot', '&': 'amp', '<': 'lt', '>': 'gt'}\r\n\r\n/**\r\n * Encode only the dangerous HTML characters.\r\n *\r\n * This ensures that certain characters which have special meaning in HTML are\r\n * dealt with.\r\n * Technically, we can skip `>` and `\"` in many cases, but CM includes them.\r\n *\r\n * @param {string} value\r\n *   Value to encode.\r\n * @returns {string}\r\n *   Encoded value.\r\n */\r\nfunction encode(value) {\r\n  return value.replace(/[\"&<>]/g, replace)\r\n\r\n  /**\r\n   * @param {string} value\r\n   *   Value to replace.\r\n   * @returns {string}\r\n   *   Encoded value.\r\n   */\r\n  function replace(value) {\r\n    return (\r\n      '&' +\r\n      characterReferences[\r\n        /** @type {keyof typeof characterReferences} */ (value)\r\n      ] +\r\n      ';'\r\n    )\r\n  }\r\n}\r\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvbWljcm9tYXJrLXV0aWwtZW5jb2RlL2luZGV4LmpzIiwibWFwcGluZ3MiOiI7Ozs7QUFBQSw2QkFBNkI7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQjtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQSxhQUFhLFFBQVE7QUFDckI7QUFDQSxlQUFlO0FBQ2Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLGtDQUFrQztBQUNyRDtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbImQ6XFxKb3lNYXRlXFxub2RlX21vZHVsZXNcXG1pY3JvbWFyay11dGlsLWVuY29kZVxcaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgY2hhcmFjdGVyUmVmZXJlbmNlcyA9IHsnXCInOiAncXVvdCcsICcmJzogJ2FtcCcsICc8JzogJ2x0JywgJz4nOiAnZ3QnfVxyXG5cclxuLyoqXHJcbiAqIEVuY29kZSBvbmx5IHRoZSBkYW5nZXJvdXMgSFRNTCBjaGFyYWN0ZXJzLlxyXG4gKlxyXG4gKiBUaGlzIGVuc3VyZXMgdGhhdCBjZXJ0YWluIGNoYXJhY3RlcnMgd2hpY2ggaGF2ZSBzcGVjaWFsIG1lYW5pbmcgaW4gSFRNTCBhcmVcclxuICogZGVhbHQgd2l0aC5cclxuICogVGVjaG5pY2FsbHksIHdlIGNhbiBza2lwIGA+YCBhbmQgYFwiYCBpbiBtYW55IGNhc2VzLCBidXQgQ00gaW5jbHVkZXMgdGhlbS5cclxuICpcclxuICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlXHJcbiAqICAgVmFsdWUgdG8gZW5jb2RlLlxyXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gKiAgIEVuY29kZWQgdmFsdWUuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZW5jb2RlKHZhbHVlKSB7XHJcbiAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoL1tcIiY8Pl0vZywgcmVwbGFjZSlcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlXHJcbiAgICogICBWYWx1ZSB0byByZXBsYWNlLlxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICogICBFbmNvZGVkIHZhbHVlLlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIHJlcGxhY2UodmFsdWUpIHtcclxuICAgIHJldHVybiAoXHJcbiAgICAgICcmJyArXHJcbiAgICAgIGNoYXJhY3RlclJlZmVyZW5jZXNbXHJcbiAgICAgICAgLyoqIEB0eXBlIHtrZXlvZiB0eXBlb2YgY2hhcmFjdGVyUmVmZXJlbmNlc30gKi8gKHZhbHVlKVxyXG4gICAgICBdICtcclxuICAgICAgJzsnXHJcbiAgICApXHJcbiAgfVxyXG59XHJcbiJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOlswXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/micromark-util-encode/index.js\n");

/***/ })

};
;