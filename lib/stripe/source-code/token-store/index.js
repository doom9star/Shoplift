 {\n    const { href: cacheKey  } = new URL(dataHref, window.location.href);\n    if (inflightCache[cacheKey] !== undefined) {\n        return inflightCache[cacheKey];\n    }\n    return inflightCache[cacheKey] = fetchRetry(dataHref, isServerRender ? 3 : 1, {\n        text\n    }).catch((err)=>{\n        // We should only trigger a server-side transition if this was caused\n        // on a client-side transition. Otherwise, we'd get into an infinite\n        // loop.\n        if (!isServerRender) {\n            (0, _routeLoader).markAssetError(err);\n        }\n        throw err;\n    }).then((data)=>{\n        if (!persistCache || \"development\" !== 'production') {\n            delete inflightCache[cacheKey];\n        }\n        return data;\n    }).catch((err)=>{\n        delete inflightCache[cacheKey];\n        throw err;\n    });\n}\nclass Router {\n    constructor(pathname1, query1, as1, { initialProps , pageLoader , App , wrapApp , Component , err: err2 , subscription , isFallback , locale , locales , defaultLocale , domainLocales , isPreview  }){\n        // Static Data Cache\n        this.sdc = {\n        };\n        // In-flight Server Data Requests, for deduping\n        this.sdr = {\n        };\n        // In-flight middleware preflight requests\n        this.sde = {\n        };\n        this._idx = 0;\n        this.onPopState = (e)=>{\n            const state = e.state;\n            if (!state) {\n                // We get state as undefined for two reasons.\n                //  1. With older safari (< 8) and older chrome (< 34)\n                //  2. When the URL changed with #\n                //\n                // In the both cases, we don't need to proceed and change the route.\n                // (as it's already changed)\n                // But we can simply replace the state with the new changes.\n                // Actually, for (1) we don't need to nothing. But it's hard to detect that event.\n                // So, doing the following for (1) does no harm.\n                const { pathname , query  } = this;\n                this.changeState('replaceState', (0, _utils).formatWithValidation({\n                    pathname: addBasePath(pathname),\n                    query\n                }), (0, _utils).getURL());\n                return;\n            }\n            if (!state.__N) {\n                return;\n            }\n            let forcedScroll;\n            const { url , as , options , idx  } = state;\n            if (false) {}\n            this._idx = idx;\n            const { pathname  } = (0, _parseRelativeUrl).parseRelativeUrl(url);\n            // Make sure we don't re-render on initial load,\n            // can be caused by navigating back from an external site\n            if (this.isSsr && as === this.asPath && pathname === this.pathname) {\n                return;\n            }\n            // If the downstream application returns falsy, return.\n            // They will then be responsible for handling the event.\n            if (this._bps && !this._bps(state)) {\n                return;\n            }\n            this.change('replaceState', url, as, Object.assign({\n            }, options, {\n                shallow: options.shallow && this._shallow,\n                locale: options.locale || this.defaultLocale\n            }), forcedScroll);\n        };\n        // represents the current component key\n        this.route = (0, _normalizeTrailingSlash).removePathTrailingSlash(pathname1);\n        // set up the component cache (by route keys)\n        this.components = {\n        };\n        // We should not keep the cache, if there's an error\n        // Otherwise, this cause issues when when going back and\n        // come again to the errored page.\n        if (pathname1 !== '/_error') {\n            var ref;\n            this.components[this.route] = {\n                Component,\n                initial: true,\n                props: initialProps,\n                err: err2,\n                __N_SSG: initialProps && initialProps.__N_SSG,\n                __N_SSP: initialProps && initialProps.__N_SSP,\n                __N_RSC: !!((ref = Component) === null || ref === void 0 ? void 0 : ref.__next_rsc__)\n            };\n        }\n        this.components['/_app'] = {\n            Component: App,\n            styleSheets: []\n        };\n        // Backwards compat for Router.router.events\n        // TODO: Should be remove the following major version as it was never documented\n        this.events = Router.events;\n        this.pageLoader = pageLoader;\n        this.pathname = pathname1;\n        this.query = query1;\n        // if auto prerendered and dynamic route wait to update asPath\n        // until after mount to prevent hydration mismatch\n        const autoExportDynamic = (0, _isDynamic).isDynamicRoute(pathname1) && self.__NEXT_DATA__.autoExport;\n        this.asPath = autoExportDynamic ? pathname1 : as1;\n        this.basePath = basePath;\n        this.sub = subscription;\n        this.clc = null;\n        this._wrapApp = wrapApp;\n        // make sure to ignore extra popState in safari on navigating\n        // back from external site\n        this.isSsr = true;\n        this.isFallback = isFallback;\n        this.isReady = !!(self.__NEXT_DATA__.gssp || self.__NEXT_DATA__.gip || self.__NEXT_DATA__.appGip && !self.__NEXT_DATA__.gsp || !autoExportDynamic && !self.location.search && !false);\n        this.isPreview = !!isPreview;\n        this.isLocaleDomain = false;\n        if (false) {}\n        if (false) {}\n    }\n    reload() {\n        window.location.reload();\n    }\n    /**\n   * Go back in history\n   */ back() {\n        window.history.back();\n    }\n    /**\n   * Performs a `pushState` with arguments\n   * @param url of the route\n   * @param as masks `url` for the browser\n   * @param options object you can define `shallow` and other options\n   */ push(url, as, options = {\n    }) {\n        if (false) {}\n        ({ url , as  } = prepareUrlAs(this, url, as));\n        return this.change('pushState', url, as, options);\n    }\n    /**\n   * Performs a `replaceState` with arguments\n   * @param url of the route\n   * @param as masks `url` for the browser\n   * @param options object you can define `shallow` and other options\n   */ replace(url1, as2, options1 = {\n    }) {\n        ({ url: url1 , as: as2  } = prepareUrlAs(this, url1, as2));\n        return this.change('replaceState', url1, as2, options1);\n    }\n    async change(method, url2, as3, options2, forcedScroll) {\n        if (!isLocalURL(url2)) {\n            window.location.href = url2;\n            return false;\n        }\n        const shouldResolveHref = options2._h || options2._shouldResolveHref || pathNoQueryHash(url2) === pathNoQueryHash(as3);\n        // for static pages with query params in the URL we delay\n        // marking the router ready until after the query is updated\n        if (options2._h) {\n            this.isReady = true;\n        }\n        const prevLocale = this.locale;\n        if (false) { var ref; }\n        if (!options2._h) {\n            this.isSsr = false;\n        }\n        // marking route changes as a navigation start entry\n        if (_utils.ST) {\n            performance.mark('routeChange');\n        }\n        const { shallow =false  } = options2;\n        const routeProps = {\n            shallow\n        };\n        if (this._inFlightRoute) {\n            this.abortComponentLoad(this._inFlightRoute, routeProps);\n        }\n        as3 = addBasePath(addLocale(hasBasePath(as3) ? delBasePath(as3) : as3, options2.locale, this.defaultLocale));\n        const cleanedAs = delLocale(hasBasePath(as3) ? delBasePath(as3) : as3, this.locale);\n        this._inFlightRoute = as3;\n        let localeChange = prevLocale !== this.locale;\n        // If the url change is only related to a hash change\n        // We should not proceed. We should only change the state.\n        // WARNING: `_h` is an internal option for handing Next.js client-side\n        // hydration. Your app should _never_ use this property. It may change at\n        // any time without notice.\n        if (!ault().create({\n    withCredentials: true,\n    baseURL: \"http://localhost:3000/api\"\n});\nconst NC = ()=>(0,next_connect__WEBPACK_IMPORTED_MODULE_1__[\"default\"])({\n        onNoMatch: (req, res)=>{\n            return res.status(405).json({\n                message: `[${req.method}] is not supported!`\n            });\n        }\n    })\n;\n\n});//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9saWIvY29uc3RhbnRzLnRzPzEzOGIuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBeUI7QUFFYTtBQUcvQixLQUFLLENBQUNFLE1BQU0sR0FBR0YsbURBQVksQ0FBQyxDQUFDO0lBQ2xDSSxlQUFlLEVBQUUsSUFBSTtJQUNyQkMsT0FBTyxFQUFFLENBQTJCO0FBQ3RDLENBQUM7QUFFTSxLQUFLLENBQUNDLEVBQUUsT0FDYkwsd0RBQVcsQ0FBZ0MsQ0FBQztRQUMxQ00sU0FBUyxHQUFHQyxHQUFHLEVBQUVDLEdBQUcsR0FBSyxDQUFDO1lBQ3hCLE1BQU0sQ0FBQ0EsR0FBRyxDQUNQQyxNQUFNLENBQUMsR0FBRyxFQUNWQyxJQUFJLENBQUMsQ0FBQztnQkFBQ0MsT0FBTyxHQUFHLENBQUMsRUFBRUosR0FBRyxDQUFDSyxNQUFNLENBQUMsbUJBQW1CO1lBQUUsQ0FBQztRQUMxRCxDQUFDO0lBQ0gsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2UtY29tbWVyY2UvLi9saWIvY29uc3RhbnRzLnRzPzA3OGUiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGF4aW9zIGZyb20gXCJheGlvc1wiO1xyXG5pbXBvcnQgeyBOZXh0QXBpUmVzcG9uc2UgfSBmcm9tIFwibmV4dFwiO1xyXG5pbXBvcnQgbmV4dENvbm5lY3QgZnJvbSBcIm5leHQtY29ubmVjdFwiO1xyXG5pbXBvcnQgeyBUQXV0aFJlcXVlc3QgfSBmcm9tIFwiLi90eXBlc1wiO1xyXG5cclxuZXhwb3J0IGNvbnN0IGNBeGlvcyA9IGF4aW9zLmNyZWF0ZSh7XHJcbiAgd2l0aENyZWRlbnRpYWxzOiB0cnVlLFxyXG4gIGJhc2VVUkw6IFwiaHR0cDovL2xvY2FsaG9zdDozMDAwL2FwaVwiLFxyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBOQyA9ICgpID0+XHJcbiAgbmV4dENvbm5lY3Q8VEF1dGhSZXF1ZXN0LCBOZXh0QXBpUmVzcG9uc2U+KHtcclxuICAgIG9uTm9NYXRjaDogKHJlcSwgcmVzKSA9PiB7XHJcbiAgICAgIHJldHVybiByZXNcclxuICAgICAgICAuc3RhdHVzKDQwNSlcclxuICAgICAgICAuanNvbih7IG1lc3NhZ2U6IGBbJHtyZXEubWV0aG9kfV0gaXMgbm90IHN1cHBvcnRlZCFgIH0pO1xyXG4gICAgfSxcclxuICB9KTtcclxuIl0sIm5hbWVzIjpbImF4aW9zIiwibmV4dENvbm5lY3QiLCJjQXhpb3MiLCJjcmVhdGUiLCJ3aXRoQ3JlZGVudGlhbHMiLCJiYXNlVVJMIiwiTkMiLCJvbk5vTWF0Y2giLCJyZXEiLCJyZXMiLCJzdGF0dXMiLCJqc29uIiwibWVzc2FnZSIsIm1ldGhvZCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./lib/constants.ts?138b\n");

/***/ }),

/***/ "./lib/context/index.tsx":
/*!*******************************!*\
  !*** ./lib/context/index.tsx ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"useGCtx\": () => (/* binding */ useGCtx),\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ \"react/jsx-runtime\");\n/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n\n\nconst GCtx = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_1__.createContext)({\n});\nconst CtxProvider = ({ children  })=>{\n    const { 0: user , 1: setUser  } = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    const { 0: cart , 1: setCart  } = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    return(/*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(GCtx.Provider, {\n        value: {\n            user,\n            setUser,\n            cart,\n            setCart\n        },\n        __source: {\n            fileName: \"D:\\\\JAVASCRIPT\\\\NEXT\\\\e-commerce\\\\lib\\\\context\\\\index.tsx\",\n            lineNumber: 10,\n            columnNumber: 5\n        },\n        __self: undefined,\n        children: children\n    }));\n};\nconst useGCtx = ()=>(0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(GCtx)\n;\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (CtxProvider);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9saWIvY29udGV4dC9pbmRleC50c3guanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUErRDtBQUcvRCxLQUFLLENBQUNHLElBQUksaUJBQUdILG9EQUFhLENBQUMsQ0FBQztBQUFBLENBQUM7QUFFN0IsS0FBSyxDQUFDSSxXQUFXLElBQVEsQ0FBQyxDQUFDQyxRQUFRLEVBQUMsQ0FBQyxHQUFLLENBQUM7SUFDekMsS0FBSyxNQUFFQyxJQUFJLE1BQUVDLE9BQU8sTUFBSUwsK0NBQVEsQ0FBZSxJQUFJO0lBQ25ELEtBQUssTUFBRU0sSUFBSSxNQUFFQyxPQUFPLE1BQUlQLCtDQUFRLENBQWdCLElBQUk7SUFDcEQsTUFBTSxzRUFDSEMsSUFBSSxDQUFDTyxRQUFRO1FBQUNDLEtBQUssRUFBRSxDQUFDO1lBQUNMLElBQUk7WUFBRUMsT0FBTztZQUFFQyxJQUFJO1lBQUVDLE9BQU87UUFBQyxDQUFDOzs7Ozs7O2tCQUNuREosUUFBUTs7QUFHZixDQUFDO0FBRU0sS0FBSyxDQUFDTyxPQUFPLE9BQVNYLGlEQUFVLENBQUNFLElBQUk7O0FBQzVDLGlFQUFlQyxXQUFXLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9lLWNvbW1lcmNlLy4vbGliL2NvbnRleHQvaW5kZXgudHN4P2RlZjIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY3JlYXRlQ29udGV4dCwgRkMsIHVzZUNvbnRleHQsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XHJcbmltcG9ydCB7IFRHQ3R4LCBUT3JkZXIsIFRVc2VyIH0gZnJvbSBcIi4uL3R5cGVzXCI7XHJcblxyXG5jb25zdCBHQ3R4ID0gY3JlYXRlQ29udGV4dCh7fSBhcyBUR0N0eCk7XHJcblxyXG5jb25zdCBDdHhQcm92aWRlcjogRkMgPSAoeyBjaGlsZHJlbiB9KSA9PiB7XHJcbiAgY29uc3QgW3VzZXIsIHNldFVzZXJdID0gdXNlU3RhdGU8VFVzZXIgfCBudWxsPihudWxsKTtcclxuICBjb25zdCBbY2FydCwgc2V0Q2FydF0gPSB1c2VTdGF0ZTxUT3JkZXIgfCBudWxsPihudWxsKTtcclxuICByZXR1cm4gKFxyXG4gICAgPEdDdHguUHJvdmlkZXIgdmFsdWU9e3sgdXNlciwgc2V0VXNlciwgY2FydCwgc2V0Q2FydCB9fT5cclxuICAgICAge2NoaWxkcmVufVxyXG4gICAgPC9HQ3R4LlByb3ZpZGVyPlxyXG4gICk7XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgdXNlR0N0eCA9ICgpID0+IHVzZUNvbnRleHQoR0N0eCk7XHJcbmV4cG9ydCBkZWZhdWx0IEN0eFByb3ZpZGVyO1xyXG4iXSwibmFtZXMiOlsiY3JlYXRlQ29udGV4dCIsInVzZUNvbnRleHQiLCJ1c2VTdGF0ZSIsIkdDdHgiLCJDdHhQcm92aWRlciIsImNoaWxkcmVuIiwidXNlciIsInNldFVzZXIiLCJjYXJ0Iiwic2V0Q2FydCIsIlByb3ZpZGVyIiwidmFsdWUiLCJ1c2VHQ3R4Il0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./lib/context/index.tsx\n");

/***/ }),

/***/ "./lib/hooks/useCart.ts":
/*!******************************!*\
  !*** ./lib/hooks/useCart.ts ***!
  \******************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__) => {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants */ \"./lib/constants.ts?138b\");\n/* harmony import */ var _context__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../context */ \"./lib/context/index.tsx\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_constants__WEBPACK_IMPORTED_MODULE_1__]);\n_constants__WEBPACK_IMPORTED_MODULE_1__ = (__webpack_async_dependencies__.then ? await __webpack_async_dependencies__ : __webpack_async_dependencies__)[0];\n\n\n\nconst useCart = ()=>{\n    const { setCart , cart  } = (0,_context__WEBPACK_IMPORTED_MODULE_2__.useGCtx)();\n    const { 0: loading , 1: setLoading  } = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(true);\n    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(()=>{\n        if (!cart) {\n            setLoading(true);\n            _constants__WEBPACK_IMPORTED_MODULE_1__.cAxios.get(`/cart`).then(({ data  })=>{\n                if (data.status === 200) setCart(data.data);\n                setLoading(false);\n            });\n        }\n    }, [\n        cart\n    ]);\n    return [\n        loading\n    ];\n};\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (useCart);\n\n});//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9saWIvaG9va3MvdXNlQ2FydC50cy5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUEyQztBQUNOO0FBQ0Q7QUFHcEMsS0FBSyxDQUFDSSxPQUFPLE9BQVMsQ0FBQztJQUNyQixLQUFLLENBQUMsQ0FBQyxDQUFDQyxPQUFPLEdBQUVDLElBQUksRUFBQyxDQUFDLEdBQUdILGlEQUFPO0lBQ2pDLEtBQUssTUFBRUksT0FBTyxNQUFFQyxVQUFVLE1BQUlQLCtDQUFRLENBQUMsSUFBSTtJQUUzQ0QsZ0RBQVMsS0FBTyxDQUFDO1FBQ2YsRUFBRSxHQUFHTSxJQUFJLEVBQUUsQ0FBQztZQUNWRSxVQUFVLENBQUMsSUFBSTtZQUNmTixrREFBVSxFQUFtQixLQUFLLEdBQUdRLElBQUksRUFBRSxDQUFDLENBQUNDLElBQUksRUFBQyxDQUFDLEdBQUssQ0FBQztnQkFDdkQsRUFBRSxFQUFFQSxJQUFJLENBQUNDLE1BQU0sS0FBSyxHQUFHLEVBQUVQLE9BQU8sQ0FBQ00sSUFBSSxDQUFDQSxJQUFJO2dCQUMxQ0gsVUFBVSxDQUFDLEtBQUs7WUFDbEIsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDLEVBQUUsQ0FBQ0Y7UUFBQUEsSUFBSTtJQUFBLENBQUM7SUFFVCxNQUFNLENBQUMsQ0FBQ0M7UUFBQUEsT0FBTztJQUFBLENBQUM7QUFDbEIsQ0FBQztBQUVELGlFQUFlSCxPQUFPLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9lLWNvbW1lcmNlLy4vbGliL2hvb2tzL3VzZUNhcnQudHM/ZmZjYyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XHJcbmltcG9ydCB7IGNBeGlvcyB9IGZyb20gXCIuLi9jb25zdGFudHNcIjtcclxuaW1wb3J0IHsgdXNlR0N0eCB9IGZyb20gXCIuLi9jb250ZXh0XCI7XHJcbmltcG9ydCB7IFRTZXJ2ZXJSZXNwb25zZSB9IGZyb20gXCIuLi90eXBlc1wiO1xyXG5cclxuY29uc3QgdXNlQ2FydCA9ICgpID0+IHtcclxuICBjb25zdCB7IHNldENhcnQsIGNhcnQgfSA9IHVzZUdDdHgoKTtcclxuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZSh0cnVlKTtcclxuXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIGlmICghY2FydCkge1xyXG4gICAgICBzZXRMb2FkaW5nKHRydWUpO1xyXG4gICAgICBjQXhpb3MuZ2V0PFRTZXJ2ZXJSZXNwb25zZT4oYC9jYXJ0YCkudGhlbigoeyBkYXRhIH0pID0+IHtcclxuICAgICAgICBpZiAoZGF0YS5zdGF0dXMgPT09IDIwMCkgc2V0Q2FydChkYXRhLmRhdGEpO1xyXG4gICAgICAgIHNldExvYWRpbmcoZmFsc2UpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9LCBbY2FydF0pO1xyXG5cclxuICByZXR1cm4gW2xvYWRpbmddO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgdXNlQ2FydDtcclxuIl0sIm5hbWVzIjpbInVzZUVmZmVjdCIsInVzZVN0YXRlIiwiY0F4aW9zIiwidXNlR0N0eCIsInVzZUNhcnQiLCJzZXRDYXJ0IiwiY2FydCIsImxvYWRpbmciLCJzZXRMb2FkaW5nIiwiZ2V0IiwidGhlbiIsImRhdGEiLCJzdGF0dXMiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./lib/hooks/useCart.ts\n");

/***/ }),

/***/ "./lib/hooks/useMe.ts":
/*!****************************!*\
  !*** ./lib/hooks/useMe.ts ***!
  \****************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__) => {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants */ \"./lib/constants.ts?138b\");\n/* harmony import */ var _context__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../context */ \"./lib/context/index.tsx\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_constants__WEBPACK_IMPORTED_MODULE_1__]);\n_constants__WEBPACK_IMPORTED_MODULE_1__ = (__webpack_async_dependencies__.then ? await __webpack_async_dependencies__ : __webpack_async_dependencies__)[0];\n\n\n\nfunction useMe() {\n    const { setUser , user  } = (0,_context__WEBPACK_IMPORTED_MODULE_2__.useGCtx)();\n    const { 0: loading , 1: setLoading  } = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(true);\n    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(()=>{\n        if (!user) {\n            setLoading(true);\n            _constants__WEBPACK_IMPORTED_MODULE_1__.cAxios.get(`/me`).then((res)=>{\n                if (res.data.status === 200) setUser(res.data.data);\n                setLoading(false);\n            });\n        }\n    }, [\n        user\n    ]);\n    return [\n        loading\n    ];\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (useMe);\n\n});//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9saWIvaG9va3MvdXNlTWUudHMuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBMkM7QUFDTjtBQUNEO1NBRzNCSSxLQUFLLEdBQUcsQ0FBQztJQUNoQixLQUFLLENBQUMsQ0FBQyxDQUFDQyxPQUFPLEdBQUVDLElBQUksRUFBQyxDQUFDLEdBQUdILGlEQUFPO0lBQ2pDLEtBQUssTUFBRUksT0FBTyxNQUFFQyxVQUFVLE1BQUlQLCtDQUFRLENBQUMsSUFBSTtJQUUzQ0QsZ0RBQVMsS0FBTyxDQUFDO1FBQ2YsRUFBRSxHQUFHTSxJQUFJLEVBQUUsQ0FBQztZQUNWRSxVQUFVLENBQUMsSUFBSTtZQUNmTixrREFBVSxFQUFtQixHQUFHLEdBQUdRLElBQUksRUFBRUMsR0FBRyxHQUFLLENBQUM7Z0JBQ2hELEVBQUUsRUFBRUEsR0FBRyxDQUFDQyxJQUFJLENBQUNDLE1BQU0sS0FBSyxHQUFHLEVBQUVSLE9BQU8sQ0FBQ00sR0FBRyxDQUFDQyxJQUFJLENBQUNBLElBQUk7Z0JBQ2xESixVQUFVLENBQUMsS0FBSztZQUNsQixDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUMsRUFBRSxDQUFDRjtRQUFBQSxJQUFJO0lBQUEsQ0FBQztJQUVULE1BQU0sQ0FBQyxDQUFDQztRQUFBQSxPQUFPO0lBQUEsQ0FBQztBQUNsQixDQUFDO0FBRUQsaUVBQWVILEtBQUssRUFBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2UtY29tbWVyY2UvLi9saWIvaG9va3MvdXNlTWUudHM/ZWNlNSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XHJcbmltcG9ydCB7IGNBeGlvcyB9IGZyb20gXCIuLi9jb25zdGFudHNcIjtcclxuaW1wb3J0IHsgdXNlR0N0eCB9IGZyb20gXCIuLi9jb250ZXh0XCI7XHJcbmltcG9ydCB7IFRTZXJ2ZXJSZXNwb25zZSB9IGZyb20gXCIuLi90eXBlc1wiO1xyXG5cclxuZnVuY3Rpb24gdXNlTWUoKSB7XHJcbiAgY29uc3QgeyBzZXRVc2VyLCB1c2VyIH0gPSB1c2VHQ3R4KCk7XHJcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUodHJ1ZSk7XHJcblxyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICBpZiAoIXVzZXIpIHtcclxuICAgICAgc2V0TG9hZGluZyh0cnVlKTtcclxuICAgICAgY0F4aW9zLmdldDxUU2VydmVyUmVzcG9uc2U+KGAvbWVgKS50aGVuKChyZXMpID0+IHtcclxuICAgICAgICBpZiAocmVzLmRhdGEuc3RhdHVzID09PSAyMDApIHNldFVzZXIocmVzLmRhdGEuZGF0YSk7XHJcbiAgICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH0sIFt1c2VyXSk7XHJcblxyXG4gIHJldHVybiBbbG9hZGluZ107XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IHVzZU1lO1xyXG4iXSwibmFtZXMiOlsidXNlRWZmZWN0IiwidXNlU3RhdGUiLCJjQXhpb3MiLCJ1c2VHQ3R4IiwidXNlTWUiLCJzZXRVc2VyIiwidXNlciIsImxvYWRpbmciLCJzZXRMb2FkaW5nIiwiZ2V0IiwidGhlbiIsInJlcyIsImRhdGEiLCJzdGF0dXMiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./lib/hooks/useMe.ts\n");

/***/ }),

/***/ "./node_modules/next/dist/client/link.js":
/*!***********************************************!*\
  !*** ./node_modules/next/dist/client/link.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", ({\n    value: true\n}));\nexports[\"default\"] = void 0;\nvar _react = _interopRequireDefault(__webpack_require__(/*! react */ \"react\"));\nvar _router = __webpack_require__(/*! ../shared/lib/router/router */ \"./node_modules/next/dist/shared/lib/router/router.js\");\nvar _router1 = __webpack_require__(/*! ./router */ \"./node_modules/next/dist/client/router.js\");\nvar _useIntersection = __webpack_require__(/*! ./use-intersection */ \"./node_modules/next/dist/client/use-intersection.js\");\nfunction _interopRequireDefault(obj) {\n    return obj && obj.__esModule ? obj : {\n        default: obj\n    };\n}\nconst prefetched = {\n};\nfunction prefetch(router, href, as, options) {\n    if (true) return;\n    if (!(0, _router).isLocalURL(href)) return;\n    // Prefetch the JSON page if asked (only in the client)\n    // We need to handle a prefetch error here since we may be\n    // loading with priority which can reject but we don't\n    // want to force navigation since this is only a prefetch\n    router.prefetch(href, as, options).catch((err)=>{\n        if (true) {\n            // rethrow to show invalid URL errors\n            throw err;\n        }\n    });\n    const curLocale = options && typeof options.locale !== 'undefined' ? options.locale : router && router.locale;\n    // Join on an invalid URI character\n    prefetched[href + '%' + as + (curLocale ? '%' + curLocale : '')] = true;\n}\nfunction isModifiedEvent(event) {\n    const { target  } = event.currentTarget;\n    return target && target !== '_self' || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.nativeEvent && event.nativeEvent.which === 2;\n}\nfunction linkClicked(e, router, href, as, replace, shallow, scroll, locale) {\n    const { nodeName  } = e.currentTarg