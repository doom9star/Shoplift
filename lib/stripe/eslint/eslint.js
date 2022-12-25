sePath(path) {\n    // we only add the basepath on relative urls\n    return addPathPrefix(path, basePath);\n}\nfunction delBasePath(path) {\n    path = path.slice(basePath.length);\n    if (!path.startsWith('/')) path = `/${path}`;\n    return path;\n}\nfunction isLocalURL(url) {\n    // prevent a hydration mismatch on href for url with anchor refs\n    if (url.startsWith('/') || url.startsWith('#') || url.startsWith('?')) return true;\n    try {\n        // absolute urls can be local if they are on the same origin\n        const locationOrigin = (0, _utils).getLocationOrigin();\n        const resolved = new URL(url, locationOrigin);\n        return resolved.origin === locationOrigin && hasBasePath(resolved.pathname);\n    } catch (_) {\n        return false;\n    }\n}\nfunction interpolateAs(route, asPathname, query) {\n    let interpolatedRoute = '';\n    const dynamicRegex = (0, _routeRegex).getRouteRegex(route);\n    const dynamicGroups = dynamicRegex.groups;\n    const dynamicMatches = (asPathname !== route ? (0, _routeMatcher).getRouteMatcher(dynamicRegex)(asPathname) : '') || // TODO: should this take priority; also need to change in the router.\n    query;\n    interpolatedRoute = route;\n    const params = Object.keys(dynamicGroups);\n    if (!params.every((param)=>{\n        let value = dynamicMatches[param] || '';\n        const { repeat , optional  } = dynamicGroups[param];\n        // support single-level catch-all\n        // TODO: more robust handling for user-error (passing `/`)\n        let replaced = `[${repeat ? '...' : ''}${param}]`;\n        if (optional) {\n            replaced = `${!value ? '/' : ''}[${replaced}]`;\n        }\n        if (repeat && !Array.isArray(value)) value = [\n            value\n        ];\n        return (optional || param in dynamicMatches) && (interpolatedRoute = interpolatedRoute.replace(replaced, repeat ? value.map(// path delimiter escaped since they are being inserted\n        // into the URL and we expect URL encoded segments\n        // when parsing dynamic route params\n        (segment)=>encodeURIComponent(segment)\n        ).join('/') : encodeURIComponent(value)) || '/');\n    })) {\n        interpolatedRoute = '' // did not satisfy all requirements\n        ;\n    // n.b. We ignore this error because we handle warning for this case in\n    // development in the `<Link>` component directly.\n    }\n    return {\n        params,\n        result: interpolatedRoute\n    };\n}\nfunction omitParmsFromQuery(query, params) {\n    const filteredQuery = {\n    };\n    Object.keys(query).forEach((key)=>{\n        if (!params.includes(key)) {\n            filteredQuery[key] = query[key];\n        }\n    });\n    return filteredQuery;\n}\nfunction resolveHref(router, href, resolveAs) {\n    // we use a dummy base url for relative urls\n    let base;\n    let urlAsString = typeof href === 'string' ? href : (0, _utils).formatWithValidation(href);\n    // repeated slashes and backslashes in the URL are considered\n    // invalid and will never match a Next.js page/file\n    const urlProtoMatch = urlAsString.match(/^[a-zA-Z]{1,}:\\/\\//);\n    const urlAsStringNoProto = urlProtoMatch ? urlAsString.substr(urlProtoMatch[0].length) : urlAsString;\n    const urlParts = urlAsStringNoProto.split('?');\n    if ((urlParts[0] || '').match(/(\\/\\/|\\\\)/)) {\n        console.error(`Invalid href passed to next/router: ${urlAsString}, repeated forward-slashes (//) or backslashes \\\\ are not valid in the href`);\n        const normalizedUrl = (0, _utils).normalizeRepeatedSlashes(urlAsStringNoProto);\n        urlAsString = (urlProtoMatch ? urlProtoMatch[0] : '') + normalizedUrl;\n    }\n    // Return because it cannot be routed by the Next.js router\n    if (!isLocalURL(urlAsString)) {\n        return resolveAs ? [\n            urlAsString\n        ] : urlAsString;\n    }\n    try {\n        base = new URL(urlAsString.startsWith('#') ? router.asPath : router.pathname, 'http://n');\n    } catch (_) {\n        // fallback to / for invalid asPath values e.g. //\n        base = new URL('/', 'http://n');\n    }\n    try {\n        const finalUrl = new URL(urlAsString, base);\n        finalUrl.pathname = (0, _normalizeTrailingSlash).normalizePathTrailingSlash(finalUrl.pathname);\n        let interpolatedAs = '';\n        if ((0, _isDynamic).isDynamicRoute(finalUrl.pathname) && finalUrl.searchParams && resolveAs) {\n            const query = (0, _querystring).searchParamsToUrlQuery(finalUrl.searchParams);\n            const { result , params  } = interpolateAs(finalUrl.pathname, finalUrl.pathname, query);\n            if (result) {\n                interpolatedAs = (0, _utils).formatWithValidation({\n                    pathname: result,\n                    hash: finalUrl.hash,\n                    query: omitParmsFromQuery(query, params)\n                });\n            }\n        }\n        // if the origin didn't change, it means we received a relative href\n        const resolvedHref = finalUrl.origin === base.origin ? finalUrl.href.slice(finalUrl.origin.length) : finalUrl.href;\n        return resolveAs ? [\n            resolvedHref,\n            interpolatedAs || resolvedHref\n        ] : resolvedHref;\n    } catch (_1) {\n        return resolveAs ? [\n            urlAsString\n        ] : urlAsString;\n    }\n}\nfunction stripOrigin(url) {\n    const origin = (0, _utils).getLocationOrigin();\n    return url.startsWith(origin) ? url.substring(origin.length) : url;\n}\nfunction prepareUrlAs(router, url, as) {\n    // If url and as provided as an object representation,\n    // we'll format them into the string version here.\n    let [resolvedHref, resolvedAs] = resolveHref(router, url, true);\n    const origin = (0, _utils).getLocationOrigin();\n    const hrefHadOrigin = resolvedHref.startsWith(origin);\n    const asHadOrigin = resolvedAs && resolvedAs.startsWith(origin);\n    resolvedHref = stripOrigin(resolvedHref);\n    resolvedAs = resolvedAs ? stripOrigin(resolvedAs) : resolvedAs;\n    const preparedUrl = hrefHadOrigin ? resolvedHref : addBasePath(resolvedHref);\n    const preparedAs = as ? stripOrigin(resolveHref(router, as)) : resolvedAs || resolvedHref;\n    return {\n        url: preparedUrl,\n        as: asHadOrigin ? preparedAs : addBasePath(preparedAs)\n    };\n}\nfunction resolveDynamicRoute(pathname, pages) {\n    const cleanPathname = (0, _normalizeTrailingSlash).removePathTrailingSlash((0, _denormalizePagePath).denormalizePagePath(pathname));\n    if (cleanPathname === '/404' || cleanPathname === '/_error') {\n        return pathname;\n    }\n    // handle resolving href for dynamic routes\n    if (!pages.includes(cleanPathname)) {\n        // eslint-disable-next-line array-callback-return\n        pages.some((page)=>{\n            if ((0, _isDynamic).isDynamicRoute(page) && (0, _routeRegex).getRouteRegex(page).re.test(cleanPathname)) {\n                pathname = page;\n                return true;\n            }\n        });\n    }\n    return (0, _normalizeTrailingSlash).removePathTrailingSlash(pathname);\n}\nconst manualScrollRestoration =  false && 0;\nconst SSG_DATA_NOT_FOUND = Symbol('SSG_DATA_NOT_FOUND');\nfunction fetchRetry(url, attempts, opts) {\n    return fetch(url, {\n        // Cookies are required to be present for Next.js' SSG \"Preview Mode\".\n        // Cookies may also be required for `getServerSideProps`.\n        //\n        // > `fetch` won’t send cookies, unless you set the credentials init\n        // > option.\n        // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch\n        //\n        // > For maximum browser compatibility when it comes to sending &\n        // > receiving cookies, always supply the `credentials: 'same-origin'`\n        // > option instead of relying on the default.\n        // https://github.com/github/fetch#caveats\n        credentials: 'same-origin'\n    }).then((res)=>{\n        if (!res.ok) {\n            if (attempts > 1 && res.status >= 500) {\n                return fetchRetry(url, attempts - 1, opts);\n            }\n            if (res.status === 404) {\n                return res.json().then((data)=>{\n                    if (data.notFound) {\n                        return {\n                            notFound: SSG_DATA_NOT_FOUND\n                        };\n                    }\n                    throw new Error(`Failed to load static props`);\n                });\n            }\n            throw new Error(`Failed to load static props`);\n        }\n        return opts.text ? res.text() : res.json();\n    });\n}\nfunction fetchNextData(dataHref, isServerRender, text, inflightCache, persistCache) {\n    const { href: cacheKey  } = new URL(dataHref, window.location.href);\n    if (inflightCache[cacheKey] !== undefined) {\n        return inflightCache[cacheKey];\n    }\n    return inflightCache[cacheKey] = fetchRetry(dataHref, isServerRender ? 3 : 1, {\n        text\n    }).catch((err)=>{\n        // We should only trigger a server-side transition if this was caused\n        // on a client-side transition. Otherwise, we'd get into an infinite\n        // loop.\n        if (!isServerRender) {\n            (0, _routeLoader).markAssetError(err);\n        }\n        throw err;\n    }).then((data)=>{\n        if (!persistCache || \"development\" !== 'production') {\n            delete inflightCache[cacheKey];\n        }\n        return data;\n    }).catch((err)=>{\n        delete inflightCache[cacheKey];\n        throw err;\n    });\n}\nclass Router {\n    constructor(pathname1, query1, as1, { initialProps , pageLoader , App , wrapApp , Component , err: err2 , subscription , isFallback , locale , locales , defaultLocale , domainLocales , isPreview  }){\n        // Static Data Cache\n        this.sdc = {\n        };\n        // In-flight Server Data Requests, for deduping\n        this.sdr = {\n        };\n        // In-flight middleware preflight requests\n        this.sde = {\n        };\n        this._idx = 0;\n        this.onPopState = (e)=>{\n            const state = e.state;\n            if (!state) {\n                // We get state as undefined for two reasons.\n                //  1. With older safari (< 8) and older chrome (< 34)\n                //  2. When the URL changed with #\n                //\n                // In the both cases, we don't need to proceed and change the route.\n                // (as it's already changed)\n                // But we can simply replace the state with the new changes.\n                // Actually, for (1) we don't need to nothing. But it's hard to detect that event.\n                // So, doing the following for (1) does no harm.\n                const { pathname , query  } = this;\n                this.changeState('replaceState', (0, _utils).formatWithValidation({\n                    pathname: addBasePath(pathname),\n                    query\n                }), (0, _utils).getURL());\n                return;\n            }\n            if (!state.__N) {\n                return;\n            }\n            let forcedScroll;\n            const { url , as , options , idx  } = state;\n            if (false) {}\n            this._idx = idx;\n            const { pathname  } = (0, _parseRelativeUrl).parseRelativeUrl(url);\n            // Make sure we don't re-render on initial load,\n            // can be caused by navigating back from an external site\n            if (this.isSsr && as === this.asPath && pathname === this.pathname) {\n                return;\n            }\n            // If the downstream application returns falsy, return.\n            // They will then be responsible for handling the event.\n            if (this._bps && !this._bps(state)) {\n                return;\n            }\n            this.change('replaceState', url, as, Object.assign({\n            }, options, {\n                shallow: options.shallow && this._shallow,\n                locale: options.locale || this.defaultLocale\n            }), forcedScroll);\n        };\n        // represents the current component key\n        this.route = (0, _normalizeTrailingSlash).removePathTrailingSlash(pathname1);\n        // set up the component cache (by route keys)\n        this.components = {\n        };==d._case;if(t){this.finishNode(t,"SwitchCase")}e.cases.push(t=this.startNode());t.consequent=[];this.next();if(i){t.test=this.parseExpression()}else{if(n){this.raiseRecoverable(this.lastTokStart,"Multiple default clauses")}n=true;t.test=null}this.expect(d.colon)}else{if(!t){this.unexpected()}t.consequent.push(this.parseStatement(null))}}this.exitScope();if(t){this.finishNode(t,"SwitchCase")}this.next();this.labels.pop();return this.finishNode(e,"SwitchStatement")};Y.parseThrowStatement=function(e){this.next();if(m.test(this.input.slice(this.lastTokEnd,this.start))){this.raise(this.lastTokEnd,"Illegal newline after throw")}e.argument=this.parseExpression();this.semicolon();return this.finishNode(e,"ThrowStatement")};var Z=[];Y.parseTryStatement=function(e){this.next();e.block=this.parseBlock();e.handler=null;if(this.type===d._catch){var t=this.startNode();this.next();if(this.eat(d.parenL)){t.param=this.parseBindingAtom();var n=t.param.type==="Identifier";this.enterScope(n?M:0);this.checkLValPattern(t.param,n?K:U);this.expect(d.parenR)}else{if(this.options.ecmaVersion<10){this.unexpected()}t.param=null;this.enterScope(0)}t.body=this.parseBlock(false);this.exitScope();e.handler=this.finishNode(t,"CatchClause")}e.finalizer=this.eat(d._finally)?this.parseBlock():null;if(!e.handler&&!e.finalizer){this.raise(e.start,"Missing catch or finally clause")}return this.finishNode(e,"TryStatement")};Y.parseVarStatement=function(e,t){this.next();this.parseVar(e,false,t);this.semicolon();return this.finishNode(e,"VariableDeclaration")};Y.parseWhileStatement=function(e){this.next();e.test=this.parseParenExpression();this.labels.push(j);e.body=this.parseStatement("while");this.labels.pop();return this.finishNode(e,"WhileStatement")};Y.parseWithStatement=function(e){if(this.strict){this.raise(this.start,"'with' in strict mode")}this.next();e.object=this.parseParenExpression();e.body=this.parseStatement("with");return this.finishNode(e,"WithStatement")};Y.parseEmptyStatement=function(e){this.next();return this.finishNode(e,"EmptyStatement")};Y.parseLabeledStatement=function(e,t,n,i){for(var r=0,a=this.labels;r<a.length;r+=1){var o=a[r];if(o.name===t){this.raise(n.start,"Label '"+t+"' is already declared")}}var s=this.type.isLoop?"loop":this.type===d._switch?"switch":null;for(var u=this.labels.length-1;u>=0;u--){var c=this.labels[u];if(c.statementStart===e.start){c.statementStart=this.start;c.kind=s}else{break}}this.labels.push({name:t,kind:s,statementStart:this.start});e.body=this.parseStatement(i?i.indexOf("label")===-1?i+"label":i:"label");this.labels.pop();e.label=n;return this.finishNode(e,"LabeledStatement")};Y.parseExpressionStatement=function(e,t){e.expression=t;this.semicolon();return this.finishNode(e,"ExpressionStatement")};Y.parseBlock=function(e,t,n){if(e===void 0)e=true;if(t===void 0)t=this.startNode();t.body=[];this.expect(d.braceL);if(e){this.enterScope(0)}while(this.type!==d.braceR){var i=this.parseStatement(null);t.body.push(i)}if(n){this.strict=false}this.next();if(e){this.exitScope()}return this.finishNode(t,"BlockStatement")};Y.parseFor=function(e,t){e.init=t;this.expect(d.semi);e.test=this.type===d.semi?null:this.parseExpression();this.expect(d.semi);e.update=this.type===d.parenR?null:this.parseExpression();this.expect(d.parenR);e.body=this.parseStatement("for");this.exitScope();this.labels.pop();return this.finishNode(e,"ForStatement")};Y.parseForIn=function(e,t){var n=this.type===d._in;this.next();if(t.type==="VariableDeclaration"&&t.declarations[0].init!=null&&(!n||this.options.ecmaVersion<8||this.strict||t.kind!=="var"||t.declarations[0].id.type!=="Identifier")){this.raise(t.start,(n?"for-in":"for-of")+" loop variable declaration may not have an initializer")}e.left=t;e.right=n?this.parseExpression():this.parseMaybeAssign();this.expect(d.parenR);e.body=this.parseStatement("for");this.exitScope();this.labels.pop();return this.finishNode(e,n?"ForInStatement":"ForOfStatement")};Y.parseVar=function(e,t,n){e.declarations=[];e.kind=n;for(;;){var i=this.startNode();this.parseVarId(i,n);if(this.eat(d.eq)){i.init=this.parseMaybeAssign(t)}else if(n==="const"&&!(this.type===d._in||this.options.ecmaVersion>=6&&this.isContextual("of"))){this.unexpected()}else if(i.id.type!=="Identifier"&&!(t&&(this.type===d._in||this.isContextual("of")))){this.raise(this.lastTokEnd,"Complex binding patterns require an initialization value")}else{i.init=null}e.declarations.push(this.finishNode(i,"VariableDeclarator"));if(!this.eat(d.comma)){break}}return e};Y.parseVarId=function(e,t){e.id=this.parseBindingAtom();this.checkLValPattern(e.id,t==="var"?V:U,false)};var Q=1,J=2,ee=4;Y.parseFunction=function(e,t,n,i,r){this.initFunction(e);if(this.options.ecmaVersion>=9||this.options.ecmaVersion>=6&&!i){if(this.type===d.star&&t&J){this.unexpected()}e.generator=this.eat(d.star)}if(this.options.ecmaVersion>=8){e.async=!!i}if(t&Q){e.id=t&ee&&this.type!==d.name?null:this.parseIdent();if(e.id&&!(t&J)){this.checkLValSimple(e.id,this.strict||e.generator||e.async?this.treatFunctionsAsVar?V:U:z)}}var a=this.yieldPos,o=this.awaitPos,s=this.awaitIdentPos;this.yieldPos=0;this.awaitPos=0;this.awaitIdentPos=0;this.enterScope(functionFlags(e.async,e.generator));if(!(t&Q)){e.id=this.type===d.name?this.parseIdent():null}this.parseFunctionParams(e);this.parseFunctionBody(e,n,false,r);this.yieldPos=a;this.awaitPos=o;this.awaitIdentPos=s;return this.finishNode(e,t&Q?"FunctionDeclaration":"FunctionExpression")};Y.parseFunctionParams=function(e){this.expect(d.parenL);e.params=this.parseBindingList(d.parenR,false,this.options.ecmaVersion>=8);this.checkYieldAwaitInDefaultParams()};Y.parseClass=function(e,t){this.next();var n=this.strict;this.strict=true;this.parseClassId(e,t);this.parseClassSuper(e);var i=this.enterClassBody();var r=this.startNode();var a=false;r.body=[];this.expect(d.braceL);while(this.type!==d.braceR){var o=this.parseClassElement(e.superClass!==null);if(o){r.body.push(o);if(o.type==="MethodDefinition"&&o.kind==="constructor"){if(a){this.raise(o.start,"Duplicate constructor in the same class")}a=true}else if(o.key&&o.key.type==="PrivateIdentifier"&&isPrivateNameConflicted(i,o)){this.raiseRecoverable(o.key.start,"Identifier '#"+o.key.name+"' has already been declared")}}}this.strict=n;this.next();e.body=this.finishNode(r,"ClassBody");this.exitClassBody();return this.finishNode(e,t?"ClassDeclaration":"ClassExpression")};Y.parseClassElement=function(e){if(this.eat(d.semi)){return null}var t=this.options.ecmaVersion;var n=this.startNode();var i="";var r=false;var a=false;var o="method";var s=false;if(this.eatContextual("static")){if(t>=13&&this.eat(d.braceL)){this.parseClassStaticBlock(n);return n}if(this.isClassElementNameStart()||this.type===d.star){s=true}else{i="static"}}n.static=s;if(!i&&t>=8&&this.eatContextual("async")){if((this.isClassElementNameStart()||this.type===d.star)&&!this.canInsertSemicolon()){a=true}else{i="async"}}if(!i&&(t>=9||!a)&&this.eat(d.star)){r=true}if(!i&&!a&&!r){var u=this.value;if(this.eatContextual("get")||this.eatContextual("set")){if(this.isClassElementNameStart()){o=u}else{i=u}}}if(i){n.computed=false;n.key=this.startNodeAt(this.lastTokStart,this.lastTokStartLoc);n.key.name=i;this.finishNode(n.key,"Identifier")}else{this.parseClassElementName(n)}if(t<13||this.type===d.parenL||o!=="method"||r||a){var c=!n.static&&checkKeyName(n,"constructor");var l=c&&e;if(c&&o!=="method"){this.raise(n.key.start,"Constructor can't have get/set modifier")}n.kind=c?"constructor":o;this.parseClassMethod(n,r,a,l)}else{this.parseClassField(n)}return n};Y.isClassElementNameStart=function(){return this.type===d.name||this.type===d.privateId||this.type===d.num||this.type===d.string||this.type===d.bracketL||this.type.keyword};Y.parseClassElementName=function(e){if(this.type===d.privateId){if(this.value==="constructor"){this.raise(this.start,"Classes can't have an element named '#constructor'")}e.computed=false;e.key=this.parsePrivateIdent()}else{this.parsePropertyName(e)}};Y.parseClassMethod=function(e,t,n,i){var r=e.key;if(e.kind==="constructor"){if(t){this.raise(r.start,"Constructor can't be a generator")}if(n){this.raise(r.start,"Constructor can't be an async method")}}else if(e.static&&checkKeyName(e,"prototype")){this.raise(r.start,"Classes may not have a static property named prototype")}var a=e.value=this.parseMethod(t,n,i);if(e.kind==="get"&&a.params.length!==0){this.raiseRecoverable(a.start,"getter should have no params")}if(e.kind==="set"&&a.params.length!==1){this.raiseRecoverable(a.start,"setter should have exactly one param")}if(e.kind==="set"&&a.params[0].type==="RestElement"){this.raiseRecoverable(a.params[0].start,"Setter cannot use rest params")}return this.finishNode(e,"MethodDefinition")};Y.parseClassField=function(e){if(checkKeyName(e,"constructor")){this.raise(e.key.start,"Classes can't have a field named 'constructor'")}else if(e.static&&checkKeyName(e,"prototype")){this.raise(e.key.start,"Classes can't have a static field named 'prototype'")}if(this.eat(d.eq)){var t=this.currentThisScope();var n=t.inClassFieldInit;t.inClassFieldInit=true;e.value=this.parseMaybeAssign();t.inClassFieldInit=n}else{e.value=null}this.semicolon();return this.finishNode(e,"PropertyDefinition")};Y.parseClassStaticBlock=function(e){e.body=[];var t=this.labels;this.labels=[];this.enterScope(P|N);while(this.type!==d.braceR){var n=this.parseStatement(null);e.body.push(n)}this.next();this.exitScope();this.labels=t;return this.finishNode(e,"StaticBlock")};Y.parseClassId=function(e,t){if(this.type===d.name){e.id=this.parseIdent();if(t){this.checkLValSimple(e.id,U,false)}}else{if(t===true){this.unexpected()}e.id=null}};Y.parseClassSuper=function(e){e.superClass=this.eat(d._extends)?this.parseExprSubscripts(false):null};Y.enterClassBody=function(){var e={declared:Object.create(null),used:[]};this.privateNameStack.push(e);return e.declared};Y.exitClassBody=function(){var e=this.privateNameStack.pop();var t=e.declared;var n=e.used;var i=this.privateNameStack.length;var r=i===0?null:this.privateNameStack[i-1];for(var a=0;a<n.length;++a){var o=n[a];if(!has(t,o.name)){if(r){r.used.push(o)}else{this.raiseRecoverable(o.start,"Private field '#"+o.name+"' must be declared in an enclosing class")}}}};function isPrivateNameConflicted(e,t){var n=t.key.name;var i=e[n];var r="true";if(t.type==="MethodDefinition"&&(t.kind==="get"||t.kind==="set")){r=(t.static?"s":"i")+t.kind}if(i==="iget"&&r==="iset"||i==="iset"&&r==="iget"||i==="sget"&&r==="sset"||i==="sset"&&r==="sget"){e[n]="true";return false}else if(!i){e[n]=r;return false}else{return true}}function checkKeyName(e,t){var n=e.computed;var i=e.key;return!n&&(i.type==="Identifier"&&i.name===t||i.type==="Literal"&&i.value===t)}Y.parseExport=function(e,t){this.next();if(this.eat(d.star)){if(this.options.ecmaVersion>=11){if(this.eatContextual("as")){e.exported=this.parseIdent(true);this.checkExport(t,e.exported.name,this.lastTokStart)}else{e.exported=null}}this.expectContextual("from");if(this.type!==d.string){this.unexpected()}e.source=this.parseExprAtom();this.semicolon();return this.finishNode(e,"ExportAllDeclaration")}if(this.eat(d._default)){this.checkExport(t,"default",this.lastTokStart);var n;if(this.type===d._function||(n=this.isAsyncFunction())){var i=this.startNode();this.next();if(n){this.next()}e.declaration=this.parseFunction(i,Q|ee,false,n)}else if(this.type===d._class){var r=this.startNode();e.declaration=this.parseClass(r,"nullableID")}else{e.declaration=this.parseMaybeAssign();this.semicolon()}return this.finishNode(e,"ExportDefaultDeclaration")}if(this.shouldParseExportStatement()){e.declaration=this.parseStatement(null);if(e.declaration.type==="VariableDeclaration"){this.checkVariableExport(t,e.declaration.declarations)}else{this.checkExport(t,e.declaration.id.name,e.declaration.id.start)}e.specifiers=[];e.source=null}else{e.declaration=null;e.specifiers=this.parseExportSpecifiers(t);if(this.eatContextual("from")){if(this.type!==d.string){this.unexpected()}e.source=this.parseExprAtom()}else{for(var a=0,o=e.specifiers;a<o.length;a+=1){var s=o[a];this.checkUnreserved(s.local);this.checkLocalExport(s.local)}e.source=null}this.semicolon()}return this.finishNode(e,"ExportNamedDeclaration")};Y.checkExport=function(e,t,n){if(!e){return}if(has(e,t)){thiGAAG,CAAC,CAAC;;KAEpB,IAAM,IAAI,GAAG,KAAK,CAAC,MAAM,CAAC;;KAE1B,MAAM,CAAC,KAAK,EAAE,CAAC,GAAG,IAAI,GAAG,IAAI,CAAC;KAC9B,MAAM,CAAC,KAAK,EAAE,CAAC,GAAG,CAAC,IAAI,IAAI,CAAC,IAAI,IAAI,CAAC;KACrC,MAAM,CAAC,KAAK,EAAE,CAAC,GAAG,CAAC,IAAI,IAAI,EAAE,IAAI,IAAI,CAAC;KACtC,MAAM,CAAC,KAAK,EAAE,CAAC,GAAG,CAAC,IAAI,IAAI,EAAE,IAAI,IAAI,CAAC;;KAEtC,MAAM,CAAC,KAAK,EAAE,CAAC,GAAGS,2BAAqC,CAAC;;KAExD,MAAM,CAAC,GAAG,CAAC,YAAY,CAAC,KAAK,CAAC,EAAE,KAAK,CAAC,CAAC;;KAEvC,KAAK,GAAG,KAAK,GAAG,IAAI,CAAC;KACrB,OAAO,KAAK,CAAC;CACf,CAAC;CAED,SAAS,eAAe,CACtB,MAAc,EACd,GAAW,EACX,KAAe,EACf,KAAa,EACb,SAAiB,EACjB,KAAS,EACT,kBAA0B,EAC1B,eAAsB,EACtB,OAAe,EACf,IAAqB;KALrB,0BAAA,EAAA,iBAAiB;KACjB,sBAAA,EAAA,SAAS;KACT,mCAAA,EAAA,0BAA0B;KAC1B,gCAAA,EAAA,sBAAsB;KACtB,wBAAA,EAAA,eAAe;KACf,qBAAA,EAAA,SAAqB;KAErB,KAAK,IAAI,CAAC,GAAG,CAAC,EAAE,CAAC,GAAG,IAAI,CAAC,MAAM,EAAE,CAAC,EAAE,EAAE;SACpC,IAAI,IAAI,CAAC,CAAC,CAAC,KAAK,KAAK;aAAE,MAAM,IAAI,SAAS,CAAC,4BAA4B,CAAC,CAAC;MAC1E;;KAGD,IAAI,CAAC,IAAI,CAAC,KAAK,CAAC,CAAC;;KAEjB,MAAM,CAAC,KAAK,EAAE,CAAC,GAAG,KAAK,CAAC,OAAO,CAAC,KAAK,CAAC,GAAGd,eAAyB,GAAGD,gBAA0B,CAAC;;KAEhG,IAAM,oBAAoB,GAAG,CAAC,OAAO;WACjC,MAAM,CAAC,KAAK,CAAC,GAAG,EAAE,KAAK,EAAE,SAAS,EAAE,MAAM,CAAC;WAC3C,MAAM,CAAC,KAAK,CAAC,GAAG,EAAE,KAAK,EAAE,SAAS,EAAE,OAAO,CAAC,CAAC;;KAEjD,KAAK,GAAG,KAAK,GAAG,oBAAoB,CAAC;KACrC,MAAM,CAAC,KAAK,EAAE,CAAC,GAAG,CAAC,CAAC;KACpB,IAAM,QAAQ,GAAG,aAAa,CAC5B,MAAM,EACN,KAAK,EACL,SAAS,EACT,KAAK,EACL,KAAK,GAAG,CAAC,EACT,kBAAkB,EAClB,eAAe,EACf,IAAI,CACL,CAAC;;KAEF,IAAI,CAAC,GAAG,EAAE,CAAC;KACX,OAAO,QAAQ,CAAC;CAClB,CAAC;CAED,SAAS,mBAAmB,CAC1B,MAAc,EACd,GAAW,EACX,KAAiB,EACjB,KAAa,EACb,OAAiB;KAEjB,MAAM,CAAC,KAAK,EAAE,CAAC,GAAGK,oBAA8B,CAAC;;KAEjD,IAAM,oBAAoB,GAAG,CAAC,OAAO;WACjC,MAAM,CAAC,KAAK,CAAC,GAAG,EAAE,KAAK,EAAE,SAAS,EAAE,MAAM,CAAC;WAC3C,MAAM,CAAC,KAAK,CAAC,GAAG,EAAE,KAAK,EAAE,SAAS,EAAE,OAAO,CAAC,CAAC;;KAEjD,KAAK,GAAG,KAAK,GAAG,oBAAoB,CAAC;KACrC,MAAM,CAAC,KAAK,EAAE,CAAC,GAAG,CAAC,CAAC;;;;KAIpB,MAAM,CA