"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/micromark-util-resolve-all";
exports.ids = ["vendor-chunks/micromark-util-resolve-all"];
exports.modules = {

/***/ "(ssr)/./node_modules/micromark-util-resolve-all/index.js":
/*!**********************************************************!*\
  !*** ./node_modules/micromark-util-resolve-all/index.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   resolveAll: () => (/* binding */ resolveAll)\n/* harmony export */ });\n/**\r\n * @import {Event, Resolver, TokenizeContext} from 'micromark-util-types'\r\n */\r\n\r\n/**\r\n * Call all `resolveAll`s.\r\n *\r\n * @param {ReadonlyArray<{resolveAll?: Resolver | undefined}>} constructs\r\n *   List of constructs, optionally with `resolveAll`s.\r\n * @param {Array<Event>} events\r\n *   List of events.\r\n * @param {TokenizeContext} context\r\n *   Context used by `tokenize`.\r\n * @returns {Array<Event>}\r\n *   Changed events.\r\n */\r\nfunction resolveAll(constructs, events, context) {\r\n  /** @type {Array<Resolver>} */\r\n  const called = []\r\n  let index = -1\r\n\r\n  while (++index < constructs.length) {\r\n    const resolve = constructs[index].resolveAll\r\n\r\n    if (resolve && !called.includes(resolve)) {\r\n      events = resolve(events, context)\r\n      called.push(resolve)\r\n    }\r\n  }\r\n\r\n  return events\r\n}\r\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvbWljcm9tYXJrLXV0aWwtcmVzb2x2ZS1hbGwvaW5kZXguanMiLCJtYXBwaW5ncyI6Ijs7OztBQUFBO0FBQ0EsWUFBWSxrQ0FBa0M7QUFDOUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsZUFBZSxrQ0FBa0MsR0FBRztBQUMvRDtBQUNBLFdBQVcsY0FBYztBQUN6QjtBQUNBLFdBQVcsaUJBQWlCO0FBQzVCO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDTztBQUNQLGFBQWEsaUJBQWlCO0FBQzlCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIkQ6XFxKb3lNYXRlXFxub2RlX21vZHVsZXNcXG1pY3JvbWFyay11dGlsLXJlc29sdmUtYWxsXFxpbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGltcG9ydCB7RXZlbnQsIFJlc29sdmVyLCBUb2tlbml6ZUNvbnRleHR9IGZyb20gJ21pY3JvbWFyay11dGlsLXR5cGVzJ1xyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBDYWxsIGFsbCBgcmVzb2x2ZUFsbGBzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1JlYWRvbmx5QXJyYXk8e3Jlc29sdmVBbGw/OiBSZXNvbHZlciB8IHVuZGVmaW5lZH0+fSBjb25zdHJ1Y3RzXHJcbiAqICAgTGlzdCBvZiBjb25zdHJ1Y3RzLCBvcHRpb25hbGx5IHdpdGggYHJlc29sdmVBbGxgcy5cclxuICogQHBhcmFtIHtBcnJheTxFdmVudD59IGV2ZW50c1xyXG4gKiAgIExpc3Qgb2YgZXZlbnRzLlxyXG4gKiBAcGFyYW0ge1Rva2VuaXplQ29udGV4dH0gY29udGV4dFxyXG4gKiAgIENvbnRleHQgdXNlZCBieSBgdG9rZW5pemVgLlxyXG4gKiBAcmV0dXJucyB7QXJyYXk8RXZlbnQ+fVxyXG4gKiAgIENoYW5nZWQgZXZlbnRzLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVBbGwoY29uc3RydWN0cywgZXZlbnRzLCBjb250ZXh0KSB7XHJcbiAgLyoqIEB0eXBlIHtBcnJheTxSZXNvbHZlcj59ICovXHJcbiAgY29uc3QgY2FsbGVkID0gW11cclxuICBsZXQgaW5kZXggPSAtMVxyXG5cclxuICB3aGlsZSAoKytpbmRleCA8IGNvbnN0cnVjdHMubGVuZ3RoKSB7XHJcbiAgICBjb25zdCByZXNvbHZlID0gY29uc3RydWN0c1tpbmRleF0ucmVzb2x2ZUFsbFxyXG5cclxuICAgIGlmIChyZXNvbHZlICYmICFjYWxsZWQuaW5jbHVkZXMocmVzb2x2ZSkpIHtcclxuICAgICAgZXZlbnRzID0gcmVzb2x2ZShldmVudHMsIGNvbnRleHQpXHJcbiAgICAgIGNhbGxlZC5wdXNoKHJlc29sdmUpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gZXZlbnRzXHJcbn1cclxuIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6WzBdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/micromark-util-resolve-all/index.js\n");

/***/ })

};
;