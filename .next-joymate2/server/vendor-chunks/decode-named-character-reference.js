"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/decode-named-character-reference";
exports.ids = ["vendor-chunks/decode-named-character-reference"];
exports.modules = {

/***/ "(ssr)/./node_modules/decode-named-character-reference/index.js":
/*!****************************************************************!*\
  !*** ./node_modules/decode-named-character-reference/index.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   decodeNamedCharacterReference: () => (/* binding */ decodeNamedCharacterReference)\n/* harmony export */ });\n/* harmony import */ var character_entities__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! character-entities */ \"(ssr)/./node_modules/character-entities/index.js\");\n\r\n\r\n// To do: next major: use `Object.hasOwn`.\r\nconst own = {}.hasOwnProperty\r\n\r\n/**\r\n * Decode a single character reference (without the `&` or `;`).\r\n * You probably only need this when you’re building parsers yourself that follow\r\n * different rules compared to HTML.\r\n * This is optimized to be tiny in browsers.\r\n *\r\n * @param {string} value\r\n *   `notin` (named), `#123` (deci), `#x123` (hexa).\r\n * @returns {string|false}\r\n *   Decoded reference.\r\n */\r\nfunction decodeNamedCharacterReference(value) {\r\n  return own.call(character_entities__WEBPACK_IMPORTED_MODULE_0__.characterEntities, value) ? character_entities__WEBPACK_IMPORTED_MODULE_0__.characterEntities[value] : false\r\n}\r\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvZGVjb2RlLW5hbWVkLWNoYXJhY3Rlci1yZWZlcmVuY2UvaW5kZXguanMiLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBb0Q7QUFDcEQ7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0EsNkRBQTZEO0FBQzdEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDTztBQUNQLGtCQUFrQixpRUFBaUIsV0FBVyxpRUFBaUI7QUFDL0QiLCJzb3VyY2VzIjpbImQ6XFxKb3lNYXRlXFxub2RlX21vZHVsZXNcXGRlY29kZS1uYW1lZC1jaGFyYWN0ZXItcmVmZXJlbmNlXFxpbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NoYXJhY3RlckVudGl0aWVzfSBmcm9tICdjaGFyYWN0ZXItZW50aXRpZXMnXHJcblxyXG4vLyBUbyBkbzogbmV4dCBtYWpvcjogdXNlIGBPYmplY3QuaGFzT3duYC5cclxuY29uc3Qgb3duID0ge30uaGFzT3duUHJvcGVydHlcclxuXHJcbi8qKlxyXG4gKiBEZWNvZGUgYSBzaW5nbGUgY2hhcmFjdGVyIHJlZmVyZW5jZSAod2l0aG91dCB0aGUgYCZgIG9yIGA7YCkuXHJcbiAqIFlvdSBwcm9iYWJseSBvbmx5IG5lZWQgdGhpcyB3aGVuIHlvdeKAmXJlIGJ1aWxkaW5nIHBhcnNlcnMgeW91cnNlbGYgdGhhdCBmb2xsb3dcclxuICogZGlmZmVyZW50IHJ1bGVzIGNvbXBhcmVkIHRvIEhUTUwuXHJcbiAqIFRoaXMgaXMgb3B0aW1pemVkIHRvIGJlIHRpbnkgaW4gYnJvd3NlcnMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZVxyXG4gKiAgIGBub3RpbmAgKG5hbWVkKSwgYCMxMjNgIChkZWNpKSwgYCN4MTIzYCAoaGV4YSkuXHJcbiAqIEByZXR1cm5zIHtzdHJpbmd8ZmFsc2V9XHJcbiAqICAgRGVjb2RlZCByZWZlcmVuY2UuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZGVjb2RlTmFtZWRDaGFyYWN0ZXJSZWZlcmVuY2UodmFsdWUpIHtcclxuICByZXR1cm4gb3duLmNhbGwoY2hhcmFjdGVyRW50aXRpZXMsIHZhbHVlKSA/IGNoYXJhY3RlckVudGl0aWVzW3ZhbHVlXSA6IGZhbHNlXHJcbn1cclxuIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6WzBdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/decode-named-character-reference/index.js\n");

/***/ })

};
;