"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/hast-util-whitespace";
exports.ids = ["vendor-chunks/hast-util-whitespace"];
exports.modules = {

/***/ "(ssr)/./node_modules/hast-util-whitespace/lib/index.js":
/*!********************************************************!*\
  !*** ./node_modules/hast-util-whitespace/lib/index.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   whitespace: () => (/* binding */ whitespace)\n/* harmony export */ });\n/**\r\n * @typedef {import('hast').Nodes} Nodes\r\n */\r\n\r\n// HTML whitespace expression.\r\n// See <https://infra.spec.whatwg.org/#ascii-whitespace>.\r\nconst re = /[ \\t\\n\\f\\r]/g\r\n\r\n/**\r\n * Check if the given value is *inter-element whitespace*.\r\n *\r\n * @param {Nodes | string} thing\r\n *   Thing to check (`Node` or `string`).\r\n * @returns {boolean}\r\n *   Whether the `value` is inter-element whitespace (`boolean`): consisting of\r\n *   zero or more of space, tab (`\\t`), line feed (`\\n`), carriage return\r\n *   (`\\r`), or form feed (`\\f`); if a node is passed it must be a `Text` node,\r\n *   whose `value` field is checked.\r\n */\r\nfunction whitespace(thing) {\r\n  return typeof thing === 'object'\r\n    ? thing.type === 'text'\r\n      ? empty(thing.value)\r\n      : false\r\n    : empty(thing)\r\n}\r\n\r\n/**\r\n * @param {string} value\r\n * @returns {boolean}\r\n */\r\nfunction empty(value) {\r\n  return value.replace(re, '') === ''\r\n}\r\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvaGFzdC11dGlsLXdoaXRlc3BhY2UvbGliL2luZGV4LmpzIiwibWFwcGluZ3MiOiI7Ozs7QUFBQTtBQUNBLGFBQWEsc0JBQXNCO0FBQ25DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsZ0JBQWdCO0FBQzNCO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxrQ0FBa0M7QUFDbEM7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbImQ6XFxKb3lNYXRlXFxub2RlX21vZHVsZXNcXGhhc3QtdXRpbC13aGl0ZXNwYWNlXFxsaWJcXGluZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAdHlwZWRlZiB7aW1wb3J0KCdoYXN0JykuTm9kZXN9IE5vZGVzXHJcbiAqL1xyXG5cclxuLy8gSFRNTCB3aGl0ZXNwYWNlIGV4cHJlc3Npb24uXHJcbi8vIFNlZSA8aHR0cHM6Ly9pbmZyYS5zcGVjLndoYXR3Zy5vcmcvI2FzY2lpLXdoaXRlc3BhY2U+LlxyXG5jb25zdCByZSA9IC9bIFxcdFxcblxcZlxccl0vZ1xyXG5cclxuLyoqXHJcbiAqIENoZWNrIGlmIHRoZSBnaXZlbiB2YWx1ZSBpcyAqaW50ZXItZWxlbWVudCB3aGl0ZXNwYWNlKi5cclxuICpcclxuICogQHBhcmFtIHtOb2RlcyB8IHN0cmluZ30gdGhpbmdcclxuICogICBUaGluZyB0byBjaGVjayAoYE5vZGVgIG9yIGBzdHJpbmdgKS5cclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqICAgV2hldGhlciB0aGUgYHZhbHVlYCBpcyBpbnRlci1lbGVtZW50IHdoaXRlc3BhY2UgKGBib29sZWFuYCk6IGNvbnNpc3Rpbmcgb2ZcclxuICogICB6ZXJvIG9yIG1vcmUgb2Ygc3BhY2UsIHRhYiAoYFxcdGApLCBsaW5lIGZlZWQgKGBcXG5gKSwgY2FycmlhZ2UgcmV0dXJuXHJcbiAqICAgKGBcXHJgKSwgb3IgZm9ybSBmZWVkIChgXFxmYCk7IGlmIGEgbm9kZSBpcyBwYXNzZWQgaXQgbXVzdCBiZSBhIGBUZXh0YCBub2RlLFxyXG4gKiAgIHdob3NlIGB2YWx1ZWAgZmllbGQgaXMgY2hlY2tlZC5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB3aGl0ZXNwYWNlKHRoaW5nKSB7XHJcbiAgcmV0dXJuIHR5cGVvZiB0aGluZyA9PT0gJ29iamVjdCdcclxuICAgID8gdGhpbmcudHlwZSA9PT0gJ3RleHQnXHJcbiAgICAgID8gZW1wdHkodGhpbmcudmFsdWUpXHJcbiAgICAgIDogZmFsc2VcclxuICAgIDogZW1wdHkodGhpbmcpXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gdmFsdWVcclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqL1xyXG5mdW5jdGlvbiBlbXB0eSh2YWx1ZSkge1xyXG4gIHJldHVybiB2YWx1ZS5yZXBsYWNlKHJlLCAnJykgPT09ICcnXHJcbn1cclxuIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6WzBdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/hast-util-whitespace/lib/index.js\n");

/***/ })

};
;